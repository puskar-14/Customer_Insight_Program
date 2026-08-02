from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class User(Base):
    """
    Represents everyone who uses the platform. 
    We use the 'role' column to figure out if they're a customer, a vendor, or the big boss (admin).
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    phone_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    
    # Vendor-specific fields (Customers and Admins just leave these blank)
    business_name = Column(String, nullable=True)
    business_category = Column(String, nullable=True)
    gst_number = Column(String, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    rating = Column(Float, default=0.0)
    
    # Access control
    role = Column(String, default="customer") # admin, vendor, customer
    status = Column(String, default="pending") # active, pending, suspended, deactivated
    joined_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    products = relationship("Product", back_populates="vendor")
    orders = relationship("Order", back_populates="vendor")
    activities = relationship("VendorActivity", back_populates="vendor")
    reviews = relationship("Review", back_populates="customer")

class Product(Base):
    """
    The stuff people actually buy! 
    Tied strictly to the vendor who uploaded it.
    """
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String, index=True)
    price = Column(Float)
    discount = Column(Float, default=0.0)
    quantity = Column(Integer)
    sku = Column(String, nullable=True)
    status = Column(String, default="active") # active, disabled
    
    picture_url = Column(String, nullable=True)
    images = Column(String, nullable=True) # JSON string array of extra images
    
    description = Column(String, nullable=True)
    tagline = Column(String, nullable=True)
    marketing_email = Column(String, nullable=True)
    
    rating = Column(Float, default=0.0)
    
    vendor_id = Column(Integer, ForeignKey("users.id"))
    vendor = relationship("User", back_populates="products")
    reviews = relationship("Review", back_populates="product")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    vendor_id = Column(Integer, ForeignKey("users.id"))
    vendor = relationship("User", back_populates="orders")
    
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer) # 1-5
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    product_id = Column(Integer, ForeignKey("products.id"))
    customer_id = Column(Integer, ForeignKey("users.id"))
    
    product = relationship("Product", back_populates="reviews")
    customer = relationship("User", back_populates="reviews")

class VendorActivity(Base):
    __tablename__ = "vendor_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_name = Column(String)
    action = Column(String)
    previous_status = Column(String, nullable=True)
    new_status = Column(String, nullable=True)
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    vendor_id = Column(Integer, ForeignKey("users.id"))
    vendor = relationship("User", back_populates="activities")
