# ShopSense 🛍️ — Intelligent Multi-Vendor E-Commerce Platform

**ShopSense** is an enterprise-grade, full-stack multi-vendor e-commerce platform engineered with a high-performance **FastAPI (Python)** backend, **PostgreSQL** relational database, and an ultra-responsive **React 18 (Vite)** frontend. 

The platform blends modern consumer storefront workflows with an advanced **Vendor Analytics Engine**, **AI Data Analyst (Text-to-SQL)**, **Machine Learning Demand Forecasting (ARIMA)**, **Vector Semantic Recommendations**, and an intelligent **2-Step Checkout System**.

---

### 📌 Core Platform Highlights
- **Customer marketplace & orders** (Unified master orders `OD-XXXXX`, live tracking & GST invoices)
- **Semantic recommendations (vector search)** (Neural vector embeddings matching shopper lifestyle intent)
- **NLP review sentiment & pros/cons** (Real-time polarity extraction and customer feedback summarization)
- **Predictive inventory & demand forecasting** (30-day ARIMA/Exponential Smoothing stock depletion curve & reorder points)
- **Advanced analytics & customer segmentation** (Net sales with return deductions, fulfillment health % & RFM clusters)
- **Stock health monitoring + PostgreSQL** (Low-stock triggers, full database ledger audit & real-time WebSockets)

---

## 🌟 Key Feature Matrix & Portals

### 🛍️ 1. Customer Experience & Marketplace Storefront (`/`)

#### A. Discovery & Catalog Browsing
- **Dynamic Storefront Catalog:** Real-time search, multi-category navigation, discount tags, dynamic price badges, and in-stock availability indicators.
- **Vector-Powered Semantic Discovery ("AI Curated for you"):** Uses neural vector embeddings to match shopper intent and lifestyle queries to personalized product discovery rails.
- **Product Inspection & Social Proof Modal:** Click any item to view high-resolution imagery, verified buyer comments, true average star ratings, and instant AI-extracted **Pros & Cons**.
- **Interactive Wishlist:** Instant one-click wishlist saving with reactive toast alerts and local state persistence.

#### B. Shopping Bag & 2-Step Checkout Flow
- **Global Zustand Cart Store:** Seamless cart state managed centrally with automatic `localStorage` synchronization (`shopsense_cart`).
- **Live Sidebar Badge & Auto-Open:** Left navigation bar reflects total item counts; adding items automatically opens the cart drawer.
- **Spacious Step 1: "Review Items":**
  - Widened 520px slide-out drawer providing ample space to inspect items before committing.
  - Large 74px product images, seller names, original price strikethroughs, discount tags, and responsive quantity steppers (`[-] [qty] [+]`).
  - Real-time unit subtotal recalculation and trash removal buttons.
  - Free Express Delivery milestone banner and full MRP price breakdown.
- **Intuitive Step 2: "Payment Option":**
  - **Order Preview Chip Rail:** Horizontal thumbnail preview of all products and total unit counts so buyers maintain visual clarity.
  - **Verified Delivery Address Card:** Shows recipient name, street address, and phone number with direct edit prompt.
  - **Multi-Method Payment Selector:**
    - 📱 **UPI / Google Pay / PhonePe / Paytm / CRED** (Instant transfer, 0 transaction fees).
    - 💳 **Debit & Credit Cards** (Visa, MasterCard, RuPay, Amex with 256-bit SSL encryption).
    - 💵 **Cash on Delivery (COD)** (Pay cash or scan QR upon doorstep arrival, no advance needed).
  - **`← Back to Review Items`** button allowing buyers to effortlessly return and edit cart quantities.
  - Safe z-index elevation (`zIndex: 100000`) guaranteeing smooth interaction above all interface layers.

#### C. Instant "Buy Now" Checkout
- Direct **Buy Now** trigger on product cards and modals opening a dedicated instant checkout modal.
- Adjust quantity on the fly and select the preferred payment method prior to order placement.

#### D. Unified Multi-Item Orders (`/orders`)
- **Master Order Grouping (`OD-XXXXX`):** Multiple items purchased together (e.g., 3 mobile phones, 5 watches) are automatically consolidated into **1 single master order** instead of fragmented records.
- **Consolidated Summary Card:** Displays Master Order ID, placement date, total unit badge (e.g. `📦 8 units (2 products)`), grand total in `₹`, and payment method badge.
- **Granular Line-Item Actions:** Individual product entries inside an order have independent actions:
  - 🔄 **Replacement Request:** Select from common replacement reasons (damaged, wrong size/color) with instant status tracking.
  - ↩️ **Return & Refund Request:** Initiate returns with immediate automated refund deduction from vendor revenue ledger.
  - ⭐ **AI Sentiment Product Review:** Rate and comment on specific items with real-time NLP sentiment extraction.
- **Printable Tax Invoice Modal:** Complete GST-compliant billing document showing seller info, buyer details, itemized table, SAC/HSN, discounts, and total payable in printable layout.
- **Live Package Tracking Modal:** Interactive milestone progress bar tracking orders across 5 stages: *Order Placed → Packed → Shipped → Out for Delivery → Delivered*.
- **Order Filters & Search:** Filter by *All Orders*, *Active / In Transit*, *Delivered*, *Returns*, or *Replacements*, with instant search by Order ID or item name.

#### E. Floating Draggable AI Shopping Assistant
- Floating conversational bot powered by Retrieval-Augmented Generation (RAG).
- Answers natural language product questions (e.g., *"Show me fitness watches under ₹1000"*) and renders interactive clickable product cards.
- **Draggable with Persistent Coordinates:** Freely drag the assistant icon anywhere across the screen; coordinates persist in `localStorage`.
- **Conflict-Free Drawer Auto-Hide:** Automatically fades out and disables pointer events when the Shopping Bag drawer opens, preventing any overlap with checkout actions.

---

### 🏪 2. Vendor / Seller Portal (`/vendor`)

#### A. Executive Dashboard Overview (`/vendor`)
- **Revenue & Profit Trajectory Area Chart:** Visualizes continuous sales velocity with zero flat gaps, royal blue gradients, white-bordered data points, and live tooltips.
- **Financial Ledger & Return Deductions:** Returned products and refunds are automatically subtracted from vendor gross revenue, providing an honest net revenue metric.
- **Order Fulfillment Health Distribution:**
  - Dynamic Donut Chart displaying overall fulfillment ratio with centered order count.
  - Granular breakdown of **Successful Orders** (🟢), **Replaced Orders** (🔵), and **Returned Orders** (🔴).
  - Proportional multi-segment progress bar and 3 detailed KPI cards reporting exact counts, percentages, and net values.
- **Category Sales Donut Chart:** Live category distribution calculated from actual database catalog and sales history.
- **Product Performance Leaderboard:** Multi-bar ranking of best-selling products with a toggle to benchmark against **Peer Marketplace Vendors**.
- **Real-Time WebSocket Sales Alerts:** Instant toast notifications pushed to the screen the moment a customer completes a checkout.
- **1-Click CSV Exports:** Quick export of Orders Ledger CSV and Inventory Audit CSV.

#### B. Deep Analytics Engine (`/vendor/analytics`)
- Multi-dimensional date filtering: `Today`, `This Week`, `This Month`, `This Quarter`, `This Year`, or `Custom Date Range`.
- Dynamic Y-axis peak calibration formatting numbers smoothly as `₹...k` / `₹...L`.
- Available on both the main dashboard overview and the standalone analytics suite.

#### C. Multi-Column Sorting & Filter Suite (`/vendor/orders`)
- **Dedicated Sort Dropdown:** Quick-sort orders by *Newest to Oldest*, *Oldest to Newest*, *Amount: High to Low*, *Amount: Low to High*, *Qty: High to Low*, or *Qty: Low to High*.
- **Interactive Table Column Headers:** Click directly on `BUYER & DATE`, `AMOUNT (₹)`, or `QTY SOLD` to toggle ascending/descending sorts with visual sort arrows (`▲`/`▼`).
- **Status Filtering Tabs:** Filter by *All*, *Pending*, *Shipped*, *Delivered*, *Cancelled*, *Returned*, or *Replaced*.
- **1-Click Reset:** Instantly revert all filters and sorts back to default.

#### D. AI Data Analyst — Text-to-SQL (`/vendor/analyst`)
- Plain-English natural language business intelligence engine.
- Translates questions (e.g., *"What is my best-selling category?"*, *"Calculate profit margins for this week"*) into validated PostgreSQL queries.
- Executes queries safely and renders conversational responses alongside tabular results and SQL syntax preview.

#### E. ML Demand Forecasting & Stock Depletion (`/vendor/forecast`)
- Time-series exponential smoothing & ARIMA algorithm projecting a **30-Day Stock Depletion Curve**.
- Computes automated **Safety Stock Buffers**, **Reorder Points**, and **Recommended Restock Quantities**.

#### F. Catalog & Inventory Hub (`/vendor/catalog` & `/vendor/inventory`)
- Stock tracking with **Total Stock** vs **Stock Left** indicators.
- Full product inspection and instant restock modal.
- **AI Marketing Campaign Generator:** Generates high-converting marketing email copy based on catalog specifications with 1-click dispatch.
- Customer review sentiment intelligence summarizing buyer feedback into quantified ratios and key pros/cons.

---

### 👔 3. Administrator Portal (`/admin`)

- **Platform GMV & Financial Ledger (`/admin/analytics`):** Real-time monitoring of Gross Merchandise Volume, overall transaction counts, and commission metrics.
- **Vendor Directory & Governance (`/admin`):** Search, filter, inspect, activate, or suspend vendor store profiles.
- **Vendor Activity Audit Trail (`/admin/activity`):** Immutable log of product creation, stock updates, and vendor status changes.
- **Platform Stock Health Alert Hub (`/admin/stock-health`):** Critical alerts for low-stock and out-of-stock items across the marketplace.
- **RFM Customer Segmentation (`/admin/segments`):** Algorithmic Recency, Frequency, and Monetary categorization dividing buyers into VIP, Loyal, Potential, and At-Risk tiers.

---

### 🔐 4. Authentication & Security

- **JWT-Based Authentication:** Secure token-based session handling with role-based route guards (`customer`, `vendor`, `admin`).
- **Pop-Up Auth Modal:** Centered dialogs with backdrop blur for Login, Registration, and Password Reset.
- **Password Strength Analyzer:** Real-time visual entropy checker with criteria indicators during registration.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Zustand (Persistent State), Recharts, Lucide Icons, Vanilla CSS Design System |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy ORM, Pydantic, Passlib / Bcrypt, python-jose (JWT), WebSockets |
| **Database** | PostgreSQL (`shopsense_db`) |
| **Machine Learning / AI** | Time-Series Forecasting (ARIMA / Exponential Smoothing), NLP Review Sentiment Polarity, Text-to-SQL Engine, Vector Semantic Search |

---

## 💻 How to Run in Visual Studio Code

### Prerequisites
1. **Python 3.10+** installed.
2. **Node.js 18+** and `npm` installed.
3. **PostgreSQL** running locally on port `5432` with database `shopsense_db`.

---

### Step 1: Open Project in VS Code
Open the root `shop-sense` directory in VS Code:
```bash
code shop-sense
```

---

### Step 2: Run the Backend (FastAPI)
Open a terminal in VS Code (`Ctrl + ~` or `Terminal -> New Terminal`):

```powershell
# Navigate to backend folder
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start FastAPI server on port 8010
python -m uvicorn main:app --reload --port 8010
```

> **Backend URL:** `http://localhost:8010`  
> **Interactive Swagger API Docs:** `http://localhost:8010/docs`

---

### Step 3: Run the Frontend (React + Vite)
Open a second terminal split in VS Code:

```powershell
# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Launch Vite development server
npm run dev
```

> **Frontend Application URL:** `http://localhost:5173`

---

## 🔑 Demo Accounts & Credentials

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **Administrator** | `shopesenseadmin@gmail.com` | `shopsensepassword` | [http://localhost:5173/admin](http://localhost:5173/admin) |
| **Vendor / Seller** | `happy@gmail.com` | `password123` | [http://localhost:5173/vendor](http://localhost:5173/vendor) |
| **Vendor / Seller** | `vendor@gmail.com` | `password123` | [http://localhost:5173/vendor](http://localhost:5173/vendor) |
| **Customer** | `harsh@gmail.com` | `password123` | [http://localhost:5173/](http://localhost:5173/) |

---

## 📖 How to Use ShopSense (Step-by-Step Guide)

Follow this end-to-end walkthrough to test and experience all features across the platform using the demo accounts.

### 🛍️ Scenario 1: Customer Journey — Shopping, 2-Step Checkout & Order Management
> **Demo Login:** Email: `harsh@gmail.com` | Password: `password123`  
> **Portal URL:** [http://localhost:5173/](http://localhost:5173/)

1. **Discover Products & Vector Semantic Search:**
   - Browse the homepage catalog across categories (*All*, *Electronics*, *Fashion*, *Home*, *Watches*).
   - Scroll down to view the **"AI Curated for you"** rail, powered by PostgreSQL vector embeddings matching buyer lifestyle queries.
   - Click on any product (e.g., *Mobile Phone* or *Smart Watch*) to open the **Product Inspection Modal** to view high-resolution photos, verified customer reviews, and AI-extracted Pros & Cons.
2. **Add to Bag & Test the 2-Step Checkout Flow:**
   - Click **Add To Bag** on 2 or more products (e.g., 2 Mobile Phones, 1 Watch).
   - Notice the left sidebar cart badge increments to `Shopping Bag [3]` and the slide-out drawer automatically opens.
   - **Step 1 ("Review Items"):** Inspect your items in the spacious 520px drawer. Adjust quantities with `[-] [qty] [+]`, observe real-time unit subtotal updates, review the Free Express Delivery banner, and click **`Proceed to Payment →`**.
   - **Step 2 ("Payment Option"):** Review the compact order thumbnail preview rail and confirmed delivery address. Select your preferred payment method:
     - 📱 **UPI / Google Pay / PhonePe** (Instant 0-fee transfer)
     - 💳 **Debit / Credit Card** (Safe 256-bit encrypted checkout)
     - 💵 **Cash on Delivery (COD)** (Pay at doorstep)
   - Click **`Place Order via {PaymentMethod}`** to finalize checkout. *(You can also click `← Back to Review Items` at any time to modify quantities!)*.
3. **Instant "Buy Now" Option:**
   - Return to the shop, select any item, and click **Buy Now**.
   - A dedicated modal pops up with item details, quantity counter, and payment options allowing you to complete single-product checkouts in seconds.
4. **Inspect Unified Master Orders (`/orders`):**
   - Click **My Orders** in the sidebar.
   - Notice that all items checked out together from your cart are consolidated into **1 Master Order Card** (`OD-XXXXX`) showing total items (e.g., `📦 3 units (2 products)`), placed date, and payment badge.
   - Click **Track Order** to view the live animated milestone tracking timeline (*Placed → Packed → Shipped → Out for Delivery → Delivered*).
   - Click **Invoice** to view and print the GST-compliant Tax Invoice.
   - Test line-item actions on individual products:
     - Click **🔄 Replace** to submit a replacement request with a specific reason.
     - Click **↩️ Return** to initiate a return request *(which automatically refunds and subtracts from the vendor's net sales ledger!)*.
     - Click **⭐ Review** to rate and write feedback; watch the backend NLP pipeline extract sentiment polarity in real time.
5. **Draggable AI Shopping Assistant:**
   - Click the floating circular robot icon at the bottom-right of the screen.
   - Ask: *"Show me budget smart watches"* or *"What are your best electronics?"*.
   - The AI retrieves real catalog products with interactive clickable cards.
   - Drag the icon anywhere on your screen. Notice that whenever you open the cart drawer, the assistant gracefully auto-hides so it never blocks the checkout button!

---

### 🏪 Scenario 2: Vendor Journey — Live Analytics, Order Fulfillment & AI BI
> **Demo Login:** Email: `happy@gmail.com` (or `vendor@gmail.com`) | Password: `password123`  
> **Portal URL:** [http://localhost:5173/vendor](http://localhost:5173/vendor)

1. **Dashboard Overview & Financial Ledger:**
   - Open the Vendor Dashboard to view the **Revenue Velocity Trajectory Area Chart** with dynamic Y-axis scaling (`₹...k`/`₹...L`), zero flat gaps, and live daily sales tooltips.
   - Note that returned products and refunds are automatically deducted from the vendor's net revenue calculations.
   - Inspect the **Order Fulfillment Health Distribution** card:
     - View the Donut chart showing overall fulfillment percentages.
     - Inspect the breakdown: 🟢 **Successful Orders**, 🔵 **Replaced Orders**, and 🔴 **Returned Orders**.
     - Review the 3 detailed KPI cards reporting exact unit counts, percentages, and net values.
   - Review the **Category Distribution Donut** and **Product Performance Leaderboard** (switch between Top Products and Peer Marketplace Vendors).
2. **Order Management, Multi-Column Sorting & Filtering:**
   - Click on the **Orders** tab.
   - Filter orders using the status pills (*All, Pending, Shipped, Delivered, Cancelled, Returned, Replaced*).
   - Use the **Sort Dropdown** to sort by *Newest to Oldest*, *Oldest to Newest*, *Amount: High to Low*, *Amount: Low to High*, *Qty: High to Low*, or *Qty: Low to High*.
   - Click directly on the interactive table headers (`BUYER & DATE`, `AMOUNT`, `QTY SOLD`) to sort with ascending/descending directional arrows (`▲`/`▼`).
3. **AI Data Analyst — Text-to-SQL (`/vendor/analyst`):**
   - Navigate to the **AI Analyst** page.
   - Ask natural language business intelligence questions:
     - *"What is my top-selling product by revenue?"*
     - *"Calculate my total sales and orders for this week"*
     - *"Which products have low stock?"*
   - Watch the engine generate safe parameterized PostgreSQL queries, execute them against the live database, and explain results with interactive tables and charts.
4. **ML Demand Forecasting & Stock Depletion (`/vendor/forecast`):**
   - Navigate to **Demand Forecast**.
   - Review the 30-day ARIMA/Exponential Smoothing stock depletion projection curve, safety stock thresholds, and recommended restock dates to prevent stockouts.
5. **Catalog Management & AI Marketing Generator (`/vendor/catalog`):**
   - View your inventory table showing **Total Stock** vs **Stock Left**.
   - Click any product to open the **Instant Restock Modal**.
   - Click **Marketing Campaign** on any item to generate high-converting promotional email copy using AI with 1-click dispatch.

---

### 👔 Scenario 3: Administrator Governance & Health Monitoring
> **Demo Login:** Email: `shopesenseadmin@gmail.com` | Password: `shopsensepassword`  
> **Portal URL:** [http://localhost:5173/admin](http://localhost:5173/admin)

1. **Marketplace Financial Ledger (`/admin/analytics`):**
   - Monitor platform-wide Gross Merchandise Volume (GMV), total orders placed, and active merchant performance.
2. **Vendor Directory & Governance (`/admin`):**
   - Search and inspect vendor profiles; toggle active or suspended status.
   - Review the **Vendor Activity Log** for immutable audit trails of store and catalog updates.
3. **Stock Health & Critical Alerts (`/admin/stock-health`):**
   - Monitor out-of-stock and low-stock critical warnings across all vendors.
4. **RFM Customer Segmentation (`/admin/segments`):**
   - Review algorithmic Recency, Frequency, and Monetary categorization segmenting buyers into VIP, Loyal, Potential, and At-Risk tiers.

---

## 📡 Key API Endpoints Reference

### Customer Storefront (`/shop`)
- `GET /shop/products` — Retrieve all active marketplace products.
- `GET /shop/products/{id}/reviews` — Retrieve product reviews with NLP sentiment breakdown.
- `POST /shop/checkout` — Check out multiple items with master order grouping (`OD-XXXXX`).
- `GET /shop/orders` — Fetch buyer order history with consolidated master orders.
- `POST /shop/reviews` — Submit a product review with automatic sentiment extraction.
- `GET /shop/recommendations/semantic` — Vector similarity product recommendations.

### Vendor Intelligence (`/vendor`)
- `GET /vendor/analytics/advanced` — Comprehensive metrics, category breakdown, and fulfillment health.
- `GET /vendor/orders` — Fetch vendor orders with sorting, filtering, and line-item details.
- `POST /vendor/analyst/query` — Text-to-SQL natural language business analyst.
- `GET /vendor/forecast/{product_id}` — 30-day ARIMA demand forecast and reorder point recommendation.
- `GET /vendor/sentiment-summary` — Catalog review sentiment aggregation and pros/cons.
- `WS /vendor/ws/orders` — WebSocket endpoint for real-time order notifications.

### Platform Administration (`/admin`)
- `GET /admin/analytics` — Platform GMV, order volume, and seller health metrics.
- `GET /admin/vendors` — Manage and inspect vendor directory.
- `GET /admin/segments` — RFM customer segmentation clusters.