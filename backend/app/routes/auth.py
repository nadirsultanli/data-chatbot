from fastapi import APIRouter, HTTPException, status, Depends, Header, Request
from typing import Optional
import logging

from app.models.auth import LoginRequest, LoginResponse, User, AuthError
from app.services.auth_service import auth_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(login_request: LoginRequest):
    """
    Authenticate user with Metabase credentials
    
    - **username**: Metabase username or email
    - **password**: Metabase password
    - **metabase_url**: Optional custom Metabase URL (uses default if not provided)
    """
    try:
        logger.info(f"Login attempt for username: {login_request.username}")
        response = await auth_service.authenticate_with_metabase(login_request)
        logger.info(f"Login successful for username: {login_request.username}")
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed due to internal error"
        )

@router.post("/logout")
async def logout(authorization: Optional[str] = Header(None, alias="Authorization")):
    """
    Logout user and invalidate session
    
    Requires Authorization header: Bearer <session_token>
    """
    logger.info(f"Logout request with auth: {authorization}")
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Use: Bearer <token>"
        )

    try:
        session_token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format"
        )
    
    success = await auth_service.logout(session_token)
    
    if success:
        return {"message": "Successfully logged out"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logout failed"
        )

@router.get("/me", response_model=User)
async def get_current_user(authorization: Optional[str] = Header(None, alias="Authorization")):
    """
    Get current user information
    
    Requires Authorization header: Bearer <session_token>
    """
    logger.info(f"Received authorization header: {authorization}")
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Use: Bearer <token>"
        )
    
    try:
        session_token = authorization.split(" ")[1]
        logger.info(f"Extracted token: {session_token[:10]}...")
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format"
        )
    
    session_data = auth_service.validate_session(session_token)
    
    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session"
        )
    
    return User(
        id=session_data.user_id,
        username=session_data.username,
        email=None,  # Would need to fetch from Metabase if needed
        first_name=None,
        last_name=None,
        is_active=True
    )

@router.get("/validate")
async def validate_session(authorization: Optional[str] = Header(None, alias="Authorization")):
    """
    Validate session token
    
    Returns session status and expiration info
    """
    logger.info(f"Validation request with auth: {authorization}")
    
    if not authorization:
        return {
            "valid": False,
            "detail": "Missing authorization header"
        }
    
    if not authorization.startswith("Bearer "):
        return {
            "valid": False,
            "detail": "Invalid authorization format. Use: Bearer <token>"
        }
    
    try:
        session_token = authorization.split(" ")[1]
    except IndexError:
        return {
            "valid": False,
            "detail": "Invalid authorization format"
        }
    
    session_data = auth_service.validate_session(session_token)
    
    if not session_data:
        return {
            "valid": False,
            "detail": "Invalid or expired session"
        }
    
    return {
        "valid": True,
        "username": session_data.username,
        "expires_at": session_data.expires_at,
        "user_id": session_data.user_id
    }

@router.get("/debug-headers")
async def debug_headers(request: Request):
    """Debug endpoint to see all headers"""
    return {
        "all_headers": dict(request.headers),
        "authorization_header": request.headers.get("authorization"),
        "Authorization_header": request.headers.get("Authorization"),
    }

@router.get("/status")
async def auth_status():
    """
    Get authentication service status
    
    Useful for monitoring and debugging
    """
    # Clean up expired sessions
    auth_service.cleanup_expired_sessions()
    
    return {
        "service": "Authentication Service",
        "status": "operational",
        "active_sessions": auth_service.get_active_sessions_count(),
        "metabase_url": auth_service.metabase_url
    }