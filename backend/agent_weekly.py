"""
ShopSense Weekly AI Vendor Advisor Agent
========================================
Runs a weekly analysis on every active vendor's store and emails them
strategic, data-driven advice — automatically.

How it works:
  1. Queries the PostgreSQL database for all active vendors.
  2. For each vendor, analyses:
       - Products with HIGH stock but LOW sales (potential discount candidates)
       - Products with LOW stock but HIGH sales (restock urgently)
       - Overall revenue trend (up/flat/down)
  3. Generates a personalised email with top 3 actionable recommendations.
  4. Sends the email via SMTP (Gmail App Password recommended).

Configuration (via environment variables or edit the CONFIG block below):
  DATABASE_URL  — PostgreSQL connection string
  SMTP_HOST     — e.g. smtp.gmail.com
  SMTP_PORT     — e.g. 587
  SMTP_USER     — sender email address
  SMTP_PASS     — Gmail App Password (not your main password)

Usage:
  # Manual run:
  python agent_weekly.py

  # Automated (GitHub Actions cron — see .github/workflows/weekly_agent.yml)

Schedule suggestion: every Monday at 8:00 AM UTC
"""

import os
import smtplib
import logging
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# ── Configuration ──────────────────────────────────────────────────────────────
CONFIG = {
    "DATABASE_URL": os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:Puskar%402005@localhost:5432/shopsense_db"
    ),
    "SMTP_HOST": os.getenv("SMTP_HOST", "smtp.gmail.com"),
    "SMTP_PORT": int(os.getenv("SMTP_PORT", "587")),
    "SMTP_USER": os.getenv("SMTP_USER", ""),       # Set via env var
    "SMTP_PASS": os.getenv("SMTP_PASS", ""),       # Set via env var
    "FROM_NAME": "ShopSense AI Advisor",
    "HIGH_STOCK_THRESHOLD": 30,   # Units — more than this = "high stock"
    "LOW_SALES_THRESHOLD": 5,     # Total sales — fewer than this = "low sales"
    "LOW_STOCK_THRESHOLD": 10,    # Units — fewer than this = "restock alert"
    "HIGH_SALES_THRESHOLD": 20,   # Total sales — more than this = "high demand"
    "DRY_RUN": os.getenv("DRY_RUN", "false").lower() == "true",  # Print email instead of sending
}


# ── Database helpers ───────────────────────────────────────────────────────────
def get_db_connection():
    """Create a raw psycopg2 connection (avoids importing the full SQLAlchemy stack)."""
    try:
        import psycopg2
        import urllib.parse

        url = CONFIG["DATABASE_URL"]
        # Parse the URL
        result = urllib.parse.urlparse(url)
        conn = psycopg2.connect(
            host=result.hostname,
            port=result.port or 5432,
            database=result.path.lstrip("/"),
            user=result.username,
            password=urllib.parse.unquote(result.password or ""),
        )
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return None


def fetch_vendors(conn):
    """Return all active vendors with their email addresses."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id, first_name, last_name, email, business_name, business_category
            FROM users
            WHERE role = 'vendor' AND status = 'active'
            ORDER BY id
        """)
        columns = [desc[0] for desc in cur.description]
        return [dict(zip(columns, row)) for row in cur.fetchall()]


def fetch_vendor_products(conn, vendor_id: int):
    """Return all products for a vendor with sales and stock data."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id, name, category, price, quantity, sales,
                   low_stock_threshold, profit_margin, status
            FROM products
            WHERE vendor_id = %s
            ORDER BY sales DESC
        """, (vendor_id,))
        columns = [desc[0] for desc in cur.description]
        return [dict(zip(columns, row)) for row in cur.fetchall()]


def fetch_recent_revenue(conn, vendor_id: int, days: int = 30) -> float:
    """Total revenue for a vendor over the last N days."""
    since = datetime.utcnow() - timedelta(days=days)
    with conn.cursor() as cur:
        cur.execute("""
            SELECT COALESCE(SUM(o.amount), 0)
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE p.vendor_id = %s
              AND o.created_at >= %s
              AND o.status NOT IN ('Returned', 'Cancelled')
        """, (vendor_id, since))
        result = cur.fetchone()
        return float(result[0]) if result else 0.0


# ── Analysis Engine ────────────────────────────────────────────────────────────
def analyse_vendor(vendor: dict, products: list, revenue_30d: float) -> dict:
    """
    Analyse a vendor's store and generate a list of recommendations.
    Returns a dict with 'recommendations' and 'summary'.
    """
    recommendations = []

    # ── Rule 1: High stock + low sales → suggest discount ────────────────────
    dead_stock = [
        p for p in products
        if (p.get("quantity") or 0) >= CONFIG["HIGH_STOCK_THRESHOLD"]
        and (p.get("sales") or 0) <= CONFIG["LOW_SALES_THRESHOLD"]
        and p.get("status") == "active"
    ]
    for product in dead_stock[:2]:   # Top 2 worst offenders
        discount_pct = 15 if (product.get("profit_margin") or 25) > 20 else 10
        recommendations.append({
            "type": "discount",
            "priority": "high",
            "product": product["name"],
            "category": product.get("category", ""),
            "message": (
                f"📦 **{product['name']}** has {product['quantity']} units in stock "
                f"but only {product['sales']} total sales. Consider running a "
                f"**{discount_pct}% discount** to accelerate sell-through and free up "
                f"warehouse space. Even a limited-time flash sale can boost visibility."
            )
        })

    # ── Rule 2: Low stock + high sales → restock urgently ────────────────────
    hot_items = [
        p for p in products
        if (p.get("quantity") or 0) <= CONFIG["LOW_STOCK_THRESHOLD"]
        and (p.get("sales") or 0) >= CONFIG["HIGH_SALES_THRESHOLD"]
        and p.get("status") == "active"
    ]
    for product in hot_items[:2]:
        recommendations.append({
            "type": "restock",
            "priority": "urgent",
            "product": product["name"],
            "category": product.get("category", ""),
            "message": (
                f"🔥 **{product['name']}** is selling fast — {product['sales']} units sold "
                f"but only {product['quantity']} left in stock. **Restock immediately** to "
                f"avoid lost sales. Running out of a top-seller can hurt your search ranking."
            )
        })

    # ── Rule 3: Inactive products dragging revenue ────────────────────────────
    inactive = [p for p in products if p.get("status") != "active"]
    if inactive:
        recommendations.append({
            "type": "activation",
            "priority": "medium",
            "product": f"{len(inactive)} products",
            "category": "",
            "message": (
                f"⚠️ You have **{len(inactive)} inactive product(s)** that are hidden from "
                f"customers. Review them — if they have stock, re-activating could immediately "
                f"add revenue without any extra inventory cost."
            )
        })

    # ── Rule 4: General revenue observation ──────────────────────────────────
    if revenue_30d == 0:
        recommendations.append({
            "type": "revenue",
            "priority": "high",
            "product": "Store-wide",
            "category": "",
            "message": (
                "📉 Your store has **₹0 revenue in the past 30 days**. Make sure your "
                "products are active, priced competitively, and have high-quality images. "
                "Consider running a 'New Arrivals' promotion or reaching out to past customers."
            )
        })
    elif revenue_30d < 1000:
        recommendations.append({
            "type": "revenue",
            "priority": "medium",
            "product": "Store-wide",
            "category": "",
            "message": (
                f"📊 Your 30-day revenue is ₹{revenue_30d:,.0f}. To grow, try bundling "
                f"complementary products, improving product photos, or enabling the "
                f"'Featured' tag on your best sellers."
            )
        })

    # Keep only top 3 recommendations (prioritise urgent > high > medium)
    priority_order = {"urgent": 0, "high": 1, "medium": 2}
    recommendations.sort(key=lambda r: priority_order.get(r["priority"], 3))
    top_recs = recommendations[:3]

    summary = (
        f"Total products: {len(products)} | "
        f"Active: {sum(1 for p in products if p.get('status') == 'active')} | "
        f"30-day revenue: ₹{revenue_30d:,.0f}"
    )

    return {"recommendations": top_recs, "summary": summary}


# ── Email Composer ─────────────────────────────────────────────────────────────
def compose_email(vendor: dict, analysis: dict) -> tuple[str, str]:
    """Return (subject, html_body) for the vendor's weekly report email."""
    vendor_name = vendor.get("first_name", "Vendor")
    business = vendor.get("business_name") or "your store"
    recs = analysis["recommendations"]
    summary = analysis["summary"]
    today = datetime.now().strftime("%B %d, %Y")

    subject = f"📈 Your Weekly ShopSense Store Report — {today}"

    rec_html = ""
    if recs:
        for i, rec in enumerate(recs, 1):
            priority_color = {
                "urgent": "#dc2626",
                "high": "#d97706",
                "medium": "#2563eb"
            }.get(rec["priority"], "#374151")

            rec_html += f"""
            <div style="background:#f9fafb; border-left:4px solid {priority_color};
                        padding:16px; margin:12px 0; border-radius:4px;">
                <div style="font-size:12px; color:{priority_color}; font-weight:600;
                            text-transform:uppercase; margin-bottom:6px;">
                    {rec['priority'].upper()} PRIORITY
                </div>
                <p style="margin:0; color:#111827; line-height:1.6;">
                    {rec['message']}
                </p>
            </div>
            """
    else:
        rec_html = """
        <div style="background:#d1fae5; border-left:4px solid #059669;
                    padding:16px; border-radius:4px;">
            <p style="margin:0; color:#065f46;">
                🌟 Excellent work! Your store is performing well this week.
                Keep maintaining your stock levels and product quality!
            </p>
        </div>
        """

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                 background:#f3f4f6; margin:0; padding:20px;">
      <div style="max-width:600px; margin:0 auto; background:#fff;
                  border-radius:12px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.07);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);
                    padding:32px 28px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:22px; font-weight:700;">
            📊 ShopSense Weekly Report
          </h1>
          <p style="color:#ddd6fe; margin:8px 0 0; font-size:14px;">{today}</p>
        </div>

        <!-- Greeting -->
        <div style="padding:28px;">
          <p style="color:#374151; margin:0 0 8px; font-size:16px;">
            Hi <strong>{vendor_name}</strong> 👋
          </p>
          <p style="color:#6b7280; margin:0 0 20px; line-height:1.6;">
            Here's your personalised weekly analysis for <strong>{business}</strong>.
            Our AI has reviewed your inventory and order data to surface the most
            impactful actions you can take this week.
          </p>

          <!-- Store Snapshot -->
          <div style="background:#f0f4ff; border-radius:8px; padding:16px; margin-bottom:24px;">
            <p style="margin:0; font-size:13px; color:#4338ca; font-weight:600;">
              📋 STORE SNAPSHOT
            </p>
            <p style="margin:6px 0 0; color:#374151; font-size:14px;">{summary}</p>
          </div>

          <!-- Recommendations -->
          <h2 style="color:#111827; font-size:16px; font-weight:700; margin:0 0 4px;">
            🎯 Top Recommendations for This Week
          </h2>
          <p style="color:#9ca3af; font-size:13px; margin:0 0 16px;">
            Ranked by potential revenue impact
          </p>

          {rec_html}

          <!-- CTA -->
          <div style="text-align:center; margin-top:28px;">
            <a href="http://localhost:5173"
               style="background:#7c3aed; color:#fff; padding:12px 28px;
                      border-radius:8px; text-decoration:none; font-weight:600;
                      display:inline-block;">
              Open Vendor Dashboard →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb; padding:16px 28px; text-align:center;
                    border-top:1px solid #e5e7eb;">
          <p style="margin:0; font-size:12px; color:#9ca3af;">
            ShopSense AI Advisor • Weekly vendor intelligence report<br>
            To stop receiving these emails, update your notification settings in your Vendor Profile.
          </p>
        </div>
      </div>
    </body>
    </html>
    """

    return subject, html_body


# ── Email Sender ───────────────────────────────────────────────────────────────
def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send an HTML email using SMTP. Returns True on success."""
    if CONFIG["DRY_RUN"]:
        logger.info(f"[DRY RUN] Would send to {to_email}: {subject}")
        logger.info(f"[DRY RUN] Body preview:\n{html_body[:500]}...")
        return True

    smtp_user = CONFIG["SMTP_USER"]
    smtp_pass = CONFIG["SMTP_PASS"]

    if not smtp_user or not smtp_pass:
        logger.warning(
            "SMTP_USER / SMTP_PASS not set. Email not sent. "
            "Set them as environment variables or run with DRY_RUN=true."
        )
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{CONFIG['FROM_NAME']} <{smtp_user}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(CONFIG["SMTP_HOST"], CONFIG["SMTP_PORT"]) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, to_email, msg.as_string())

        logger.info(f"✅ Email sent successfully to {to_email}")
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error(
            "SMTP authentication failed. If using Gmail, make sure you're using an "
            "App Password, not your regular password. "
            "See: https://support.google.com/accounts/answer/185833"
        )
        return False
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


# ── Main Agent Loop ────────────────────────────────────────────────────────────
def run_weekly_agent():
    """Main entry point — runs the full weekly analysis cycle."""
    logger.info("=" * 60)
    logger.info("ShopSense Weekly AI Advisor Agent — Starting...")
    logger.info(f"Mode: {'DRY RUN (no emails sent)' if CONFIG['DRY_RUN'] else 'LIVE'}")
    logger.info("=" * 60)

    conn = get_db_connection()
    if not conn:
        logger.error("Cannot connect to database. Aborting.")
        return

    try:
        vendors = fetch_vendors(conn)
        logger.info(f"Found {len(vendors)} active vendor(s) to analyse.")

        success_count = 0
        fail_count = 0

        for vendor in vendors:
            vendor_id = vendor["id"]
            vendor_email = vendor["email"]
            logger.info(f"\n→ Analysing vendor #{vendor_id}: {vendor.get('business_name', vendor_email)}")

            # Gather data
            products = fetch_vendor_products(conn, vendor_id)
            revenue_30d = fetch_recent_revenue(conn, vendor_id, days=30)

            logger.info(f"  Products: {len(products)} | 30d Revenue: ₹{revenue_30d:,.0f}")

            # Run analysis
            analysis = analyse_vendor(vendor, products, revenue_30d)
            recs = analysis["recommendations"]
            logger.info(f"  Generated {len(recs)} recommendation(s).")

            if not recs:
                logger.info("  No critical issues found — skipping email.")
                continue

            # Compose and send
            subject, html_body = compose_email(vendor, analysis)
            sent = send_email(vendor_email, subject, html_body)

            if sent:
                success_count += 1
            else:
                fail_count += 1

    finally:
        conn.close()

    logger.info("\n" + "=" * 60)
    logger.info(f"Agent complete. Sent: {success_count} | Failed: {fail_count}")
    logger.info("=" * 60)


if __name__ == "__main__":
    run_weekly_agent()
