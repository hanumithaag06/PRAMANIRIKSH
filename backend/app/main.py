from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.seed_data import initialize_database
from app.api.auth import router as auth_router
from app.api.kits import router as kits_router
from app.api.tests import router as tests_router
from app.api.evidence import router as evidence_router
from app.api.sync import router as sync_router
from app.api.knowledge import router as knowledge_router
from app.api.i18n import router as i18n_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="PRAMANIRIKSH — AI-Powered Field Test Verification & Tamper-Evident Evidence Companion for Ministry of Home Affairs / Narcotics Control Bureau (NCB)"
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(kits_router, prefix=settings.API_V1_STR)
app.include_router(tests_router, prefix=settings.API_V1_STR)
app.include_router(evidence_router, prefix=settings.API_V1_STR)
app.include_router(sync_router, prefix=settings.API_V1_STR)
app.include_router(knowledge_router, prefix=settings.API_V1_STR)
app.include_router(i18n_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    initialize_database()

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "organization": "Ministry of Home Affairs / Narcotics Control Bureau",
        "problem_statement_id": "26231",
        "disclaimer": "PRESUMPTIVE FIELD-TEST RESULT & Tamper-Evident Evidence Companion. Does not replace confirmatory laboratory testing.",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "cv_engine": "READY", "evidence_signer": "ONLINE"}
