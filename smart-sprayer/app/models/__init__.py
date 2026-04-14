from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.database import Base

# Association table for many-to-many relationship
disease_pesticide = Table(
    "disease_pesticide",
    Base.metadata,
    Column("disease_id", Integer, ForeignKey("diseases.id")),
    Column("pesticide_id", Integer, ForeignKey("pesticides.id"))
)

class Plant(Base):
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    scientific_name = Column(String)
    description = Column(Text)

    diseases = relationship("Disease", back_populates="plant")

class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    symptoms = Column(Text)
    plant_id = Column(Integer, ForeignKey("plants.id"))

    plant = relationship("Plant", back_populates="diseases")
    pesticides = relationship("Pesticide", secondary=disease_pesticide, back_populates="diseases")

class Pesticide(Base):
    __tablename__ = "pesticides"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    disease = Column(String, index=True, nullable=True)
    active_ingredient = Column(String)
    description = Column(Text)
    application_rate = Column(Float)
    safety_instructions = Column(Text)

    diseases = relationship("Disease", secondary=disease_pesticide, back_populates="pesticides")
