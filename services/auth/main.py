from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import User, Base, UserCreate, UserLogin
from auth import hash_password, verify_password, create_token, get_current_user

app = FastAPI()

Base.metadata.create_all(bind=engine)

# dépendance DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


#TOTO: ajouter nom et prénom pour register
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(
        username=user.username,
        role=user.role,
        hashed_password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    return {"message": "user created"}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": db_user.username})

    return {"access_token": token}

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.get("/protected")
def protected(user=Depends(get_current_user)):
    return {"user": user}