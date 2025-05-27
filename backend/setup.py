#!/usr/bin/env python3
import os

# Create directory structure
directories = [
    "app",
    "app/models",
    "app/services", 
    "app/routes",
    "app/middleware",
    "app/utils"
]

for directory in directories:
    os.makedirs(directory, exist_ok=True)
    init_file = os.path.join(directory, "__init__.py")
    with open(init_file, "w") as f:
        f.write("# Auto-generated __init__.py\n")

# Create missing route files
chat_routes = '''from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test_chat():
    return {"message": "Chat routes working - will implement soon!"}
'''

schema_routes = '''from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test_schema():
    return {"message": "Schema routes working - will implement soon!"}
'''

# Write route files
with open("app/routes/chat.py", "w") as f:
    f.write(chat_routes)

with open("app/routes/schema.py", "w") as f:
    f.write(schema_routes)

# Fix config.py import
config_content = '''import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # OpenAI Configuration
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = "gpt-3.5-turbo"
    
    # Metabase Configuration
    metabase_url: str = os.getenv("METABASE_URL", "")
    metabase_database_id: str = os.getenv("METABASE_DATABASE_ID", "")
    
    # CORS Configuration
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # OpenAI Prompts Configuration
    max_tokens: int = 1000
    temperature: float = 0.1
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

# Validation function
def validate_settings():
    """Validate required settings"""
    required_settings = [
        ("openai_api_key", settings.openai_api_key),
        ("metabase_url", settings.metabase_url),
        ("metabase_database_id", settings.metabase_database_id),
    ]
    
    missing = [name for name, value in required_settings if not value]
    
    if missing:
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    return True
'''

with open("app/config.py", "w") as f:
    f.write(config_content)

# Create .env file if it doesn't exist
if not os.path.exists(".env"):
    env_content = '''# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Metabase Configuration
METABASE_URL=https://your-metabase-instance.com
METABASE_DATABASE_ID=your_database_id

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
'''
    with open(".env", "w") as f:
        f.write(env_content)

print("✅ Setup complete!")
print("📁 Created directory structure")
print("📄 Created missing route files")
print("🔧 Fixed config.py import")
print("⚙️ Created .env file (edit with your values)")
print("\n🚀 Now run: uvicorn app.main:app --reload")