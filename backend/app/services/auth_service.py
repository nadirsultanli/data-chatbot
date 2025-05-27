import httpx
import secrets
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status

from app.config import settings
from app.models.auth import LoginRequest, LoginResponse, User, SessionData, MetabaseAuthResponse

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.sessions: Dict[str, SessionData] = {}
        self.metabase_url = settings.metabase_url.rstrip('/')
        
    async def authenticate_with_metabase(self, login_request: LoginRequest) -> LoginResponse:
        """Authenticate user with Metabase and create session"""
        try:
            # Use provided metabase_url or default from settings
            metabase_url = self.metabase_url
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Step 1: Authenticate with Metabase
                auth_response = await client.post(
                    f"{metabase_url}/api/session",
                    json={
                        "username": login_request.username,
                        "password": login_request.password
                    },
                    headers={"Content-Type": "application/json"}
                )
                
                if auth_response.status_code != 200:
                    logger.warning(f"Metabase authentication failed: {auth_response.status_code}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid Metabase credentials"
                    )
                
                metabase_session_data = auth_response.json()
                metabase_session_id = metabase_session_data.get("id")
                
                if not metabase_session_id:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to get Metabase session ID"
                    )
                
                # Step 2: Get user information
                user_response = await client.get(
                    f"{metabase_url}/api/user/current",
                    headers={
                        "X-Metabase-Session": metabase_session_id,
                        "Content-Type": "application/json"
                    }
                )
                
                if user_response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to get user information from Metabase"
                    )
                
                user_data = user_response.json()
                
                # Step 3: Create our own session token
                session_token = secrets.token_urlsafe(32)
                expires_at = datetime.utcnow() + timedelta(hours=24)
                
                # Store session data
                session_data = SessionData(
                    username=login_request.username,
                    metabase_session_id=metabase_session_id,
                    user_id=user_data.get("id"),
                    expires_at=expires_at
                )
                
                self.sessions[session_token] = session_data
                
                # Create user object
                user_info = {
                    "id": user_data.get("id"),
                    "username": login_request.username,
                    "email": user_data.get("email"),
                    "first_name": user_data.get("first_name"),
                    "last_name": user_data.get("last_name"),
                    "is_active": user_data.get("is_active", True),
                    "is_superuser": user_data.get("is_superuser", False)
                }
                
                logger.info(f"Successfully authenticated user: {login_request.username}")
                
                return LoginResponse(
                    session_token=session_token,
                    user_info=user_info,
                    expires_at=expires_at,
                    metabase_session_id=metabase_session_id
                )
                
        except httpx.RequestError as e:
            logger.error(f"Network error during Metabase authentication: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to connect to Metabase server"
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during authentication: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication failed due to internal error"
            )
    
    def validate_session(self, session_token: str) -> Optional[SessionData]:
        """Validate session token and return session data"""
        if not session_token:
            return None
            
        session_data = self.sessions.get(session_token)
        if not session_data:
            return None
            
        # Check if session has expired
        if datetime.utcnow() > session_data.expires_at:
            # Remove expired session
            del self.sessions[session_token]
            return None
            
        return session_data
    
    async def logout(self, session_token: str) -> bool:
        """Logout user and invalidate session"""
        try:
            session_data = self.sessions.get(session_token)
            if not session_data:
                return False
                
            # Invalidate Metabase session
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.delete(
                    f"{self.metabase_url}/api/session",
                    headers={"X-Metabase-Session": session_data.metabase_session_id}
                )
            
            # Remove our session
            del self.sessions[session_token]
            logger.info(f"Successfully logged out user: {session_data.username}")
            return True
            
        except Exception as e:
            logger.error(f"Error during logout: {e}")
            # Still remove our session even if Metabase logout fails
            if session_token in self.sessions:
                del self.sessions[session_token]
            return True
    
    def get_active_sessions_count(self) -> int:
        """Get number of active sessions"""
        current_time = datetime.utcnow()
        active_sessions = [
            session for session in self.sessions.values()
            if session.expires_at > current_time
        ]
        return len(active_sessions)
    
    def cleanup_expired_sessions(self):
        """Remove expired sessions"""
        current_time = datetime.utcnow()
        expired_tokens = [
            token for token, session in self.sessions.items()
            if session.expires_at <= current_time
        ]
        
        for token in expired_tokens:
            del self.sessions[token]
            
        if expired_tokens:
            logger.info(f"Cleaned up {len(expired_tokens)} expired sessions")

# Global auth service instance
auth_service = AuthService()