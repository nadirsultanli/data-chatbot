from fastapi import APIRouter, HTTPException, status, Depends, Header
from typing import Optional
import logging

from app.services.auth_service import auth_service
# Remove this import to avoid circular import issues
# from app.services.database_service import database_service
from app.models.auth import SessionData

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency to get current user
async def get_current_user(authorization: Optional[str] = Header(None)) -> SessionData:
    """Dependency to validate user session"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    session_token = authorization.split(" ")[1]
    session_data = auth_service.validate_session(session_token)
    
    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session"
        )
    
    return session_data

@router.get("/analyze")
async def analyze_database_schema(current_user: SessionData = Depends(get_current_user)):
    """
    Analyze and return the complete database schema
    
    This endpoint retrieves your actual Metabase database structure including:
    - All tables and their columns
    - Data types and constraints
    - Primary and foreign keys
    - Sample data from each table
    """
    try:
        # Import here to avoid circular import issues
        from app.services.database_service import database_service
        
        logger.info(f"Analyzing database schema for user {current_user.username}")
        
        # Get complete schema
        schema_info = await database_service.get_database_schema(current_user.metabase_session_id)
        
        # Build human-readable context
        schema_context = database_service.build_schema_context(schema_info)
        
        # Get table relationships
        relationships = await database_service.get_table_relationships(schema_info)
        
        return {
            "database_name": schema_info.get("database_name"),
            "database_type": schema_info.get("database_type"),
            "total_tables": len(schema_info.get("tables", [])),
            "tables": schema_info.get("tables"),
            "relationships": relationships,
            "schema_summary": schema_context
        }
        
    except Exception as e:
        logger.error(f"Error analyzing database schema: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze database schema: {str(e)}"
        )

@router.get("/tables")
async def get_tables_list(current_user: SessionData = Depends(get_current_user)):
    """
    Get a simple list of all tables in the database
    """
    try:
        # Import here to avoid circular import issues
        from app.services.database_service import database_service
        
        schema_info = await database_service.get_database_schema(current_user.metabase_session_id)
        
        tables = []
        for table in schema_info.get("tables", []):
            tables.append({
                "name": table.get("name"),
                "display_name": table.get("display_name"),
                "row_count": table.get("row_count"),
                "column_count": len(table.get("columns", []))
            })
        
        return {
            "database_name": schema_info.get("database_name"),
            "total_tables": len(tables),
            "tables": tables
        }
        
    except Exception as e:
        logger.error(f"Error getting tables list: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tables: {str(e)}"
        )

@router.get("/table/{table_name}/sample")
async def get_table_sample_data(
    table_name: str,
    limit: int = 5,
    current_user: SessionData = Depends(get_current_user)
):
    """
    Get sample data from a specific table
    
    - **table_name**: Name of the table to sample
    - **limit**: Number of rows to return (default: 5, max: 20)
    """
    try:
        # Import here to avoid circular import issues
        from app.services.database_service import database_service
        
        if limit > 20:
            limit = 20
        
        sample_data = await database_service.get_sample_data(
            current_user.metabase_session_id,
            table_name,
            limit
        )
        
        return {
            "table_name": table_name,
            "sample_count": len(sample_data),
            "data": sample_data
        }
        
    except Exception as e:
        logger.error(f"Error getting sample data for table {table_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sample data: {str(e)}"
        )

@router.get("/test")
async def test_schema():
    """Test endpoint to verify schema routes are working"""
    return {
        "message": "Database schema service is operational",
        "features": [
            "Complete database schema analysis",
            "Table structure and relationships",
            "Sample data retrieval",
            "Metabase integration"
        ]
    }