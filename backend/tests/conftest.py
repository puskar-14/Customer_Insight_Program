"""
conftest.py — pytest session-level setup for ShopSense unit tests.

Creates a fresh SQLite test database before the session starts and
drops it automatically when the session ends.
"""

import os
import sys
import pytest

# ── Add backend root to path so "import main, models, ..." works ─────────────
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# ── Override environment so startup_event doesn't blow up ────────────────────
os.environ["TESTING"] = "1"

# ── Swap the database engine BEFORE importing main ───────────────────────────
import database  # noqa: E402 — must come after sys.path setup
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
import models  # noqa: E402

_TEST_DB_PATH = os.path.join(_backend_dir, "tests", "_test_shopsense.db")
_TEST_DATABASE_URL = f"sqlite:///{_TEST_DB_PATH}"

_test_engine = create_engine(
    _TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
_TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_test_engine)

# Patch the database module so every get_db() call uses the test engine
database.engine = _test_engine
database.SessionLocal = _TestingSessionLocal

# Create all tables in the test database
models.Base.metadata.drop_all(bind=_test_engine)   # clean slate
models.Base.metadata.create_all(bind=_test_engine)


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    """Remove the test database file after the whole session completes."""
    yield
    # Dispose engine connections then delete the file
    _test_engine.dispose()
    if os.path.exists(_TEST_DB_PATH):
        try:
            os.remove(_TEST_DB_PATH)
        except PermissionError:
            pass  # Windows sometimes holds the file — it's fine, CI will clean it up
