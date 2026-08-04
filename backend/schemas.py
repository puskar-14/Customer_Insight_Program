from pydantic import BaseModel
from typing import Optional, List
import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    business_name: Optional[str] = None
    business_category: Optional[str] = None
    gst_number: Optional[str] = None
    profile_picture_url: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: str = "customer"

class PasswordReset(BaseModel):
    email: str
    new_password: str

class MarketingEmailRequest(BaseModel):
    content: str

class NotifyVendorRequest(BaseModel):
    notification_type: str # 'out_of_stock', 'price_increase'

class User(UserBase):
    id: int
    role: str
    status: str
    rating: float
    joined_date: datetime.datetime

    class Config:
        from_attributes = True

# --- Product Schemas ---
class ProductBase(BaseModel):
    title: str
    category: str
    price: float
    discount: Optional[float] = 0.0
    quantity: int
    sales: Optional[int] = 0
    sku: Optional[str] = None
    status: Optional[str] = "active"
    picture_url: Optional[str] = None
    images: Optional[str] = None
    description: Optional[str] = None
    tagline: Optional[str] = None
    marketing_email: Optional[str] = None
    rating: Optional[float] = 0.0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    vendor_id: int

    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderBase(BaseModel):
    amount: float

class OrderCreate(OrderBase):
    vendor_id: int

class Order(OrderBase):
    id: int
    created_at: datetime.datetime
    vendor_id: int

    class Config:
        from_attributes = True

# --- Review Schemas ---
class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    product_id: int

class Review(ReviewBase):
    id: int
    created_at: datetime.datetime
    product_id: int
    customer_id: Optional[int] = None
    
    class Config:
        from_attributes = True

# --- Activity Schemas ---
class VendorActivityBase(BaseModel):
    admin_name: str
    action: str
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    remarks: Optional[str] = None

class VendorActivityCreate(VendorActivityBase):
    vendor_id: int

class VendorActivity(VendorActivityBase):
    id: int
    created_at: datetime.datetime
    vendor_id: int

    class Config:
        from_attributes = True

# --- Analytics Schemas ---
class VendorAnalytics(BaseModel):
    total_products: int
    total_orders: int
    revenue: float
    average_order_value: float
    best_selling_product: Optional[str] = None
    monthly_growth: float
    revenue_history: List[dict] = []

class AIRequest(BaseModel):
    title: str
    category: str

class AIResponse(BaseModel):
    tagline: str
    description: str
    marketing_email: str
