from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import Contact, Testimonial, BlogPost
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter()

# Schemas
class ContactCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str

class TestimonialResponse(BaseModel):
    id: int
    name: str
    city: Optional[str]
    rating: int
    comment: str
    created_at: date
    
    class Config:
        from_attributes = True

class BlogPostResponse(BaseModel):
    id: int
    slug: str
    title: str
    content: str
    cover_image: Optional[str]
    published_at: Optional[date]
    
    class Config:
        from_attributes = True

# Public Endpoints

@router.post("/contacts")
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    db_contact = Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return {"status": "success", "message": "Message received"}

@router.get("/testimonials", response_model=List[TestimonialResponse])
def get_testimonials(db: Session = Depends(get_db)):
    return db.query(Testimonial).filter(Testimonial.is_approved == True).all()

@router.get("/blog", response_model=List[BlogPostResponse])
def get_blog_posts(db: Session = Depends(get_db)):
    return db.query(BlogPost).filter(BlogPost.status == "PUBLISHED").all()

@router.get("/blog/{slug}", response_model=BlogPostResponse)
def get_blog_post_by_slug(slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.status == "PUBLISHED").first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post
