from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import Contact, Testimonial, BlogPost, User
from app.api.deps import get_current_admin
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter()

# Schemas
class ContactUpdate(BaseModel):
    status: str

class TestimonialUpdate(BaseModel):
    is_approved: bool

class BlogPostCreate(BaseModel):
    slug: str
    title: str
    content: str
    cover_image: Optional[str] = None
    status: str = "DRAFT"

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None
    cover_image: Optional[str] = None
    slug: Optional[str] = None

# Admin Endpoints

# --- CONTACTS ---
@router.get("/contacts")
def list_contacts(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return db.query(Contact).order_by(Contact.created_at.desc()).all()

@router.patch("/contacts/{id}")
def update_contact_status(id: int, status: ContactUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    contact = db.query(Contact).filter(Contact.id == id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    contact.status = status.status
    db.commit()
    return {"status": "updated"}

# --- TESTIMONIALS ---
@router.get("/testimonials")
def list_testimonials(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return db.query(Testimonial).order_by(Testimonial.created_at.desc()).all()

@router.post("/testimonials")
def create_testimonial(
    name: str = Body(...),
    comment: str = Body(...),
    rating: int = Body(5),
    city: str = Body(None),
    db: Session = Depends(get_db), 
    admin: User = Depends(get_current_admin)
):
    # Admin can manually add testimonials
    t = Testimonial(name=name, comment=comment, rating=rating, city=city, is_approved=True)
    db.add(t)
    db.commit()
    return {"status": "created"}

@router.patch("/testimonials/{id}")
def moderate_testimonial(id: int, update: TestimonialUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    t = db.query(Testimonial).filter(Testimonial.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    t.is_approved = update.is_approved
    db.commit()
    return {"status": "updated"}

@router.delete("/testimonials/{id}")
def delete_testimonial(id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    t = db.query(Testimonial).filter(Testimonial.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(t)
    db.commit()
    return {"status": "deleted"}

# --- BLOG ---
@router.get("/blog")
def list_blog_posts(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return db.query(BlogPost).order_by(BlogPost.id.desc()).all()

@router.post("/blog")
def create_blog_post(post: BlogPostCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    db_post = BlogPost(**post.model_dump(), created_by_id=admin.id)
    if post.status == "PUBLISHED":
        db_post.published_at = date.today()
    db.add(db_post)
    db.commit()
    return {"status": "created", "id": db_post.id}

@router.patch("/blog/{id}")
def update_blog_post(id: int, post: BlogPostUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    db_post = db.query(BlogPost).filter(BlogPost.id == id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = post.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_post, key, value)
    
    if post.status == "PUBLISHED" and not db_post.published_at:
        db_post.published_at = date.today()
        
    db.commit()
    return {"status": "updated"}

@router.delete("/blog/{id}")
def delete_blog_post(id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
     db_post = db.query(BlogPost).filter(BlogPost.id == id).first()
     if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
     db.delete(db_post)
     db.commit()
     return {"status": "deleted"}
