from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Disease, Pesticide
from app.utils.image_processing import detect_disease

router = APIRouter()

class PesticideSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    disease: str | None = None
    active_ingredient: str
    description: str
    application_rate: float
    safety_instructions: str


class DiseaseDetectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    disease_id: int | None = None
    disease_name: str
    confidence: float
    plant_name: str | None = None
    description: str
    symptoms: str | None = None
    severity: str
    recommended_pesticides: List[PesticideSummary]
    available_pesticides: List[PesticideSummary]
    spray_suggestions: List[str]


def serialize_pesticide(pesticide: Pesticide) -> PesticideSummary:
    return PesticideSummary(
        id=pesticide.id,
        name=pesticide.name,
        disease=pesticide.disease,
        active_ingredient=pesticide.active_ingredient,
        description=pesticide.description,
        application_rate=pesticide.application_rate,
        safety_instructions=pesticide.safety_instructions,
    )


def get_severity(confidence: float) -> str:
    if confidence >= 0.9:
        return "Severe"
    if confidence >= 0.75:
        return "Moderate"
    return "Mild"

@router.post("/detect-disease", response_model=DiseaseDetectionResponse)
async def detect_disease_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate file type
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    try:
        # Read image file
        contents = await file.read()

        # Detect disease (placeholder implementation)
        disease_result = detect_disease(contents)

        # Get disease details from database
        disease = db.query(Disease).filter(Disease.name == disease_result["name"]).first()
        available_pesticides = [
            serialize_pesticide(pesticide)
            for pesticide in db.query(Pesticide).order_by(Pesticide.name.asc()).all()
        ]

        if not disease:
            return DiseaseDetectionResponse(
                disease_id=None,
                disease_name="Unknown",
                confidence=disease_result["confidence"],
                plant_name=None,
                description="Disease not recognized",
                symptoms="No matching symptoms found in the database.",
                severity=get_severity(disease_result["confidence"]),
                recommended_pesticides=[],
                available_pesticides=available_pesticides,
                spray_suggestions=[
                    "Retake the image in better lighting for a cleaner diagnosis.",
                    "Inspect the crop manually before spraying any pesticide.",
                    "Consult a plant pathologist if symptoms continue to spread.",
                ],
            )

        disease_linked_pesticides = db.query(Pesticide).filter(
            func.lower(Pesticide.disease).contains(disease.name.lower())
        ).order_by(Pesticide.name.asc()).all()

        relation_pesticides = list(disease.pesticides)
        seen_pesticide_ids = set()
        recommended_pesticides = []
        for pesticide in [*disease_linked_pesticides, *relation_pesticides]:
            if pesticide.id in seen_pesticide_ids:
                continue
            seen_pesticide_ids.add(pesticide.id)
            recommended_pesticides.append(serialize_pesticide(pesticide))

        spray_suggestions = [
            f"Start with {pesticide.name} at {pesticide.application_rate} ml/L."
            for pesticide in recommended_pesticides[:2]
        ]
        if not spray_suggestions:
            spray_suggestions.append("No disease-linked pesticide is stored yet. Review the full pesticide list before spraying.")

        return DiseaseDetectionResponse(
            disease_id=disease.id,
            disease_name=disease.name,
            confidence=disease_result["confidence"],
            plant_name=disease.plant.name if disease.plant else None,
            description=disease.description,
            symptoms=disease.symptoms,
            severity=get_severity(disease_result["confidence"]),
            recommended_pesticides=recommended_pesticides,
            available_pesticides=available_pesticides,
            spray_suggestions=spray_suggestions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
