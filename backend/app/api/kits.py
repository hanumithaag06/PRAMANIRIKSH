from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import KitProfile
from app.schemas.schemas import KitProfileResponse, KitProfileBase

router = APIRouter(prefix="/kits", tags=["Kit Profiles"])

def kit_to_response(kit):
    if hasattr(KitProfileResponse, "model_validate"):
        return KitProfileResponse.model_validate(kit)
    return KitProfileResponse.from_orm(kit)

@router.get("", response_model=list[KitProfileResponse])
def list_kits(db: Session = Depends(get_db)):
    kits = db.query(KitProfile).filter(KitProfile.is_active == True).all()
    return [kit_to_response(k) for k in kits]

@router.get("/{kit_id}", response_model=KitProfileResponse)
def get_kit(kit_id: str, db: Session = Depends(get_db)):
    kit = db.query(KitProfile).filter((KitProfile.id == kit_id) | (KitProfile.kit_code == kit_id)).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Kit Profile not found")
    return kit_to_response(kit)

@router.post("", response_model=KitProfileResponse)
def create_kit(kit_in: KitProfileBase, db: Session = Depends(get_db)):
    existing = db.query(KitProfile).filter(KitProfile.kit_code == kit_in.kit_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Kit Profile with this code already exists")
        
    kit = KitProfile(**kit_in.dict())
    db.add(kit)
    db.commit()
    db.refresh(kit)
    return kit_to_response(kit)
