import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    """Application settings loaded from environment variables"""
    
    def __init__(self):
        # OpenAI Configuration
        self.openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
        self.openai_model: str = "gpt-3.5-turbo"
        self.max_tokens: int = 1000
        self.temperature: float = 0.1
        
        # Metabase Configuration
        self.metabase_url: str = os.getenv("METABASE_URL", "").rstrip('/')
        self.metabase_database_id: str = os.getenv("METABASE_DATABASE_ID", "")
        
        # CORS Configuration
        self.frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        # Validate settings on initialization
        self._validate()
    
    def _validate(self):
        """Validate required settings"""
        required_settings = [
            ("OPENAI_API_KEY", self.openai_api_key),
            ("METABASE_URL", self.metabase_url),
            ("METABASE_DATABASE_ID", self.metabase_database_id),
        ]
        
        missing = [name for name, value in required_settings if not value]
        
        if missing:
            print(f"⚠️ Warning: Missing environment variables: {', '.join(missing)}")
            print("Please check your .env file")
    
    def is_valid(self) -> bool:
        """Check if all required settings are present"""
        return bool(
            self.openai_api_key and 
            self.metabase_url and 
            self.metabase_database_id
        )

# Global settings instance
settings = Settings()

# Validation function for backward compatibility
def validate_settings():
    """Validate required settings - raises error if invalid"""
    if not settings.is_valid():
        missing = []
        if not settings.openai_api_key:
            missing.append("OPENAI_API_KEY")
        if not settings.metabase_url:
            missing.append("METABASE_URL")
        if not settings.metabase_database_id:
            missing.append("METABASE_DATABASE_ID")
            
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    return True