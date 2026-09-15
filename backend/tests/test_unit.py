"""
ShopSense — Unit Tests
======================
Tests the most critical API endpoints using FastAPI's TestClient with an
SQLite test database (no live PostgreSQL required).

Run with:
    cd backend
    .\\venv\\Scripts\\python.exe -m pytest tests/ -v

Or from the repo root via GitHub Actions:
    pip install -r requirements.txt
    pytest tests/ -v
"""

import os
import sys
import pytest

# ── Ensure the backend directory is on sys.path ──────────────────────────────
# conftest.py handles DB patching BEFORE this file is imported by pytest.
# We just need to make sure the backend root is on sys.path for direct imports.
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Import app AFTER conftest has patched the database engine
from main import app  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

client = TestClient(app, raise_server_exceptions=False)



# ── Fixtures ───────────────────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def registered_customer():
    """Register a test customer and return the response JSON."""
    payload = {
        "email": "testcustomer@shopsense.test",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "Customer",
        "role": "customer",
        "phone_number": "9999999999",
        "address": "123 Test Street",
        "business_name": None,
        "business_category": None,
        "gst_number": None,
    }
    resp = client.post("/auth/register", json=payload)
    return resp


@pytest.fixture(scope="session")
def customer_token(registered_customer):
    """Login as the test customer and return a valid JWT."""
    resp = client.post(
        "/auth/login",
        data={
            "username": "testcustomer@shopsense.test",
            "password": "TestPass123!",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture(scope="session")
def registered_vendor():
    """Register a test vendor and return the response JSON."""
    payload = {
        "email": "testvendor@shopsense.test",
        "password": "VendorPass456!",
        "first_name": "Test",
        "last_name": "Vendor",
        "role": "vendor",
        "phone_number": "8888888888",
        "address": "456 Vendor Road",
        "business_name": "Test Emporium",
        "business_category": "Electronics",
        "gst_number": "22AAAAA0000A1Z5",
    }
    resp = client.post("/auth/register", json=payload)
    return resp


# ── Auth Tests ─────────────────────────────────────────────────────────────────
class TestAuth:
    def test_register_customer_success(self, registered_customer):
        """POST /auth/register — new customer should return 200 with user object."""
        resp = registered_customer
        assert resp.status_code == 200, f"Unexpected status: {resp.status_code} — {resp.text}"
        data = resp.json()
        assert data["email"] == "testcustomer@shopsense.test"
        assert data["role"] == "customer"
        assert "hashed_password" not in data, "Password hash must not be exposed in response"

    def test_register_vendor_success(self, registered_vendor):
        """POST /auth/register — new vendor should be created with 'pending' status."""
        resp = registered_vendor
        assert resp.status_code == 200, f"Unexpected status: {resp.status_code} — {resp.text}"
        data = resp.json()
        assert data["role"] == "vendor"
        assert data["status"] == "pending", "Vendors must start as pending (admin approval required)"

    def test_register_duplicate_email(self, registered_customer):
        """POST /auth/register — duplicate email should return 400."""
        payload = {
            "email": "testcustomer@shopsense.test",  # already registered
            "password": "AnotherPass!",
            "first_name": "Dupe",
            "last_name": "User",
            "role": "customer",
        }
        resp = client.post("/auth/register", json=payload)
        assert resp.status_code == 400
        assert "already registered" in resp.json()["detail"].lower()

    def test_login_success(self, customer_token):
        """POST /auth/login — valid credentials should return a JWT."""
        assert customer_token is not None
        assert len(customer_token) > 20, "Token looks too short to be a real JWT"

    def test_login_wrong_password(self):
        """POST /auth/login — wrong password should return 401."""
        resp = client.post(
            "/auth/login",
            data={
                "username": "testcustomer@shopsense.test",
                "password": "WrongPassword!",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert resp.status_code == 401

    def test_login_nonexistent_user(self):
        """POST /auth/login — non-existent user should return 401."""
        resp = client.post(
            "/auth/login",
            data={"username": "nobody@nowhere.com", "password": "Anything123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert resp.status_code == 401

    def test_get_me_authenticated(self, customer_token):
        """GET /auth/me — authenticated request should return the user object."""
        resp = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "testcustomer@shopsense.test"

    def test_get_me_unauthenticated(self):
        """GET /auth/me — unauthenticated request should return 401."""
        resp = client.get("/auth/me")
        assert resp.status_code == 401


# ── Shop / Product Tests ───────────────────────────────────────────────────────
class TestShopProducts:
    def test_get_products_returns_list(self):
        """GET /shop/products — should return a list (even if empty with fresh DB)."""
        resp = client.get("/shop/products")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_products_structure(self):
        """GET /shop/products — each product should have expected keys."""
        resp = client.get("/shop/products")
        assert resp.status_code == 200
        products = resp.json()
        if products:
            product = products[0]
            for key in ["id", "name", "price", "category"]:
                assert key in product, f"Missing key '{key}' in product response"

    def test_rule_based_recommendations(self):
        """GET /shop/recommendations/rule-based — should return 200 with a list."""
        resp = client.get("/shop/recommendations/rule-based")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_semantic_recommendations(self):
        """GET /shop/recommendations/semantic — should return 200 with a list."""
        resp = client.get("/shop/recommendations/semantic?q=wireless+headphones")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ── Protected Route Tests ─────────────────────────────────────────────────────
class TestProtectedRoutes:
    def test_checkout_requires_auth(self):
        """POST /shop/checkout — unauthenticated should return 401."""
        resp = client.post("/shop/checkout", json={})
        assert resp.status_code == 401

    def test_get_orders_requires_auth(self):
        """GET /shop/orders — unauthenticated should return 401."""
        resp = client.get("/shop/orders")
        assert resp.status_code == 401

    def test_vendor_dashboard_requires_auth(self):
        """GET /vendor/orders — unauthenticated should return 401."""
        resp = client.get("/vendor/orders")
        assert resp.status_code == 401

    def test_vendor_products_requires_auth(self):
        """GET /vendor/products — unauthenticated should return 401."""
        resp = client.get("/vendor/products")
        assert resp.status_code == 401

    def test_admin_vendors_requires_auth(self):
        """GET /admin/vendors — unauthenticated should return 401."""
        resp = client.get("/admin/vendors")
        assert resp.status_code == 401

    def test_admin_analytics_requires_auth(self):
        """GET /admin/analytics — unauthenticated should return 401."""
        resp = client.get("/admin/analytics")
        assert resp.status_code == 401


# ── Password Reset Tests ───────────────────────────────────────────────────────
class TestPasswordReset:
    def test_reset_password_unknown_email(self):
        """POST /auth/reset-password — unknown email should return 404."""
        resp = client.post(
            "/auth/reset-password",
            json={"email": "ghost@nowhere.com", "new_password": "NewPass123!"},
        )
        assert resp.status_code == 404

    def test_reset_password_success(self, registered_customer):
        """POST /auth/reset-password — known email should return success message."""
        resp = client.post(
            "/auth/reset-password",
            json={
                "email": "testcustomer@shopsense.test",
                "new_password": "UpdatedPass999!",
            },
        )
        assert resp.status_code == 200
        assert "updated" in resp.json()["message"].lower()


# ── AI Agent Unit Tests (no DB / no SMTP needed) ──────────────────────────────
class TestAIAgent:
    """Unit tests for the weekly AI agent logic (pure functions, no I/O)."""

    def _make_product(self, qty=50, sales=2, status="active", price=999.0):
        return {
            "id": 1, "name": "Test Widget", "category": "Electronics",
            "price": price, "quantity": qty, "sales": sales,
            "low_stock_threshold": 10, "profit_margin": 25.0, "status": status
        }

    def test_high_stock_low_sales_triggers_discount(self):
        """Analyse: product with high stock + low sales → discount recommendation."""
        # Import inside test to avoid circular issues at module level
        from agent_weekly import analyse_vendor  # noqa: F401
        vendor = {"id": 1, "first_name": "Test", "email": "v@test.com",
                  "business_name": "Test Store", "business_category": "Electronics"}
        products = [self._make_product(qty=50, sales=2)]
        result = analyse_vendor(vendor, products, revenue_30d=500.0)
        rec_types = [r["type"] for r in result["recommendations"]]
        assert "discount" in rec_types, f"Expected discount recommendation, got: {rec_types}"

    def test_low_stock_high_sales_triggers_restock(self):
        """Analyse: product with low stock + high sales → restock recommendation."""
        from agent_weekly import analyse_vendor
        vendor = {"id": 1, "first_name": "Test", "email": "v@test.com",
                  "business_name": "Test Store", "business_category": "Electronics"}
        products = [self._make_product(qty=3, sales=25)]
        result = analyse_vendor(vendor, products, revenue_30d=5000.0)
        rec_types = [r["type"] for r in result["recommendations"]]
        assert "restock" in rec_types, f"Expected restock recommendation, got: {rec_types}"

    def test_zero_revenue_triggers_revenue_alert(self):
        """Analyse: zero revenue → revenue recommendation."""
        from agent_weekly import analyse_vendor
        vendor = {"id": 1, "first_name": "Test", "email": "v@test.com",
                  "business_name": "Test Store", "business_category": "Electronics"}
        products = [self._make_product(qty=5, sales=5)]
        result = analyse_vendor(vendor, products, revenue_30d=0.0)
        rec_types = [r["type"] for r in result["recommendations"]]
        assert "revenue" in rec_types

    def test_max_3_recommendations(self):
        """Analyse: should never return more than 3 recommendations."""
        from agent_weekly import analyse_vendor
        vendor = {"id": 1, "first_name": "Test", "email": "v@test.com",
                  "business_name": "Test Store", "business_category": "Electronics"}
        # Create products that trigger multiple rules
        products = [
            self._make_product(qty=50, sales=1),   # discount
            self._make_product(qty=3, sales=30),   # restock
            {"id": 3, "name": "Inactive", "category": "X",
             "price": 100, "quantity": 0, "sales": 0,
             "low_stock_threshold": 10, "profit_margin": 10, "status": "inactive"},
        ]
        result = analyse_vendor(vendor, products, revenue_30d=0.0)
        assert len(result["recommendations"]) <= 3

    def test_dry_run_does_not_raise(self):
        """send_email in DRY_RUN mode should return True without SMTP connection."""
        from agent_weekly import send_email, CONFIG
        original = CONFIG["DRY_RUN"]
        CONFIG["DRY_RUN"] = True
        try:
            result = send_email("vendor@test.com", "Test Subject", "<p>body</p>")
            assert result is True
        finally:
            CONFIG["DRY_RUN"] = original
