import os

try:
    from pydantic_settings import BaseSettings
except ImportError:
    class BaseSettings:
        pass

class Settings:
    PROJECT_NAME: str = "PRAMANIRIKSH — AI-Powered Field Test Verification"
    VERSION: str = "1.0.0"
    CV_PIPELINE_VERSION: str = "2.1.0"
    CLASSIFIER_VERSION: str = "1.4.0"
    API_V1_STR: str = "/api/v1"
    
    # SQLite default database for simple zero-dependency standalone execution
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pramaniriksh.db")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "pramaniriksh_sih_2026_super_secret_key_987654321")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

settings = Settings()
