from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    session_token: str
    user_info: dict
    expires_at: datetime
    metabase_session_id: str

class SessionData(BaseModel):
    username: str
    metabase_session_id: str
    user_id: int
    expires_at: datetime

class User(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False

class MetabaseAuthResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    common_name: str
    locale: Optional[str] = None
    is_active: bool
    is_superuser: bool
    is_qbnewb: bool
    login_attributes: dict = {}

class AuthError(BaseModel):
    detail: str
    error_code: str = "AUTH_ERROR"