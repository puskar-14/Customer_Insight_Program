import jwt
import bcrypt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import database, models

# Security constants - Note: In a real prod environment, these should be in a .env file!
SECRET_KEY = "super_secret_key_for_shop_sense_demo"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # Tokens expire in 1 day

# Tells FastAPI where clients should send their username and password to get a token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    """Verifies the JWT token and fetches the current user from the database."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Oops, we couldn't validate your credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the token to see who it belongs to
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        # If the token is expired or tampered with, kick them out
        raise credentials_exception
        
    # Grab the user from the DB
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user

def get_current_active_vendor(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if current_user.status != "active":
        raise HTTPException(status_code=403, detail="Vendor account is suspended or deactivated")
    return current_user

def get_current_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
