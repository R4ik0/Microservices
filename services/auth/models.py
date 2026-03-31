from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, default="user")
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "user"
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    username: str
    password: str