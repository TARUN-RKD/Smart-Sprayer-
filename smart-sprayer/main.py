from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import socket
from app.api.disease_detection import router as disease_router
from app.api.pesticide_recommendation import router as pesticide_router
from app.db.database import engine, Base, ensure_schema
from app.models import Plant, Disease, Pesticide

# Create database tables
Base.metadata.create_all(bind=engine)
ensure_schema()

app = FastAPI(title="Smart Sprayer", description="Plant disease detection and pesticide recommendation system")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Mount static files when the directory exists.
static_dir = os.path.join(BASE_DIR, "static")
if os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Templates
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "app/templates"))

# Include routers
app.include_router(disease_router, prefix="/api", tags=["Disease Detection"])
app.include_router(pesticide_router, prefix="/api", tags=["Pesticide Recommendation"])

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
