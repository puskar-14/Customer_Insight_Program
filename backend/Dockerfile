# ─── ShopSense Backend — Docker Image ───────────────────────────────────────
# FastAPI + Uvicorn on Python 3.11-slim
# Build:  docker build -t shopsense-backend .
# Run:    docker run -p 8010:8010 --env DATABASE_URL=... shopsense-backend
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install OS-level build tools needed by psycopg2-binary, bcrypt, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifest first (layer caching — only re-runs pip install if requirements change)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend source
COPY . .

# Create uploads directory (needed by StaticFiles mount)
RUN mkdir -p static/uploads

# Expose the API port
EXPOSE 8010

# Environment variables (can be overridden at runtime via -e or docker-compose)
ENV DATABASE_URL=""
ENV SECRET_KEY="change-me-in-production"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Start Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8010"]
