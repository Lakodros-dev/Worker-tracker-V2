from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os

from app.config import settings
from app.database import init_db
from app.routers import auth, users, locations, reports, settings as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="HR-Tracker V2 API",
    description="Hodimlar davomatini kuzatish tizimi",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "healthy"}


@app.get("/")
async def root():
    return {"message": "HR-Tracker V2 API", "status": "running"}


# Serve static frontend files if they exist (for combined deployment)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't serve for API routes
        if full_path.startswith("api/"):
            return {"error": "Not found"}
        
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # SPA fallback - serve index.html
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
