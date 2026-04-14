from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Disease, Pesticide

router = APIRouter()

class PesticideResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    disease: str | None = None
    active_ingredient: str
    description: str
    application_rate: float
    safety_instructions: str


class SprayRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    pesticide_id: int
    disease_id: int | None = None


class SprayResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    success: bool
    pesticide_name: str
    disease_name: str | None = None
    message: str

@router.get("/pesticides", response_model=List[PesticideResponse])
def get_pesticides(db: Session = Depends(get_db)):
    pesticides = db.query(Pesticide).all()
    return pesticides

@router.get("/pesticides/{pesticide_id}", response_model=PesticideResponse)
def get_pesticide(pesticide_id: int, db: Session = Depends(get_db)):
    pesticide = db.query(Pesticide).filter(Pesticide.id == pesticide_id).first()
    if not pesticide:
        raise HTTPException(status_code=404, detail="Pesticide not found")
    return pesticide


@router.post("/spray", response_model=SprayResponse)
def spray_pesticide(payload: SprayRequest, db: Session = Depends(get_db)):
    pesticide = db.query(Pesticide).filter(Pesticide.id == payload.pesticide_id).first()
    if not pesticide:
        raise HTTPException(status_code=404, detail="Pesticide not found")

    disease = None
    if payload.disease_id is not None:
        disease = db.query(Disease).filter(Disease.id == payload.disease_id).first()

    disease_name = disease.name if disease else None
    message = f"Spray command prepared for {pesticide.name}."
    if disease_name:
        message = f"Spray command prepared for {pesticide.name} against {disease_name}."

    return SprayResponse(
        success=True,
        pesticide_name=pesticide.name,
        disease_name=disease_name,
        message=message,
    )
