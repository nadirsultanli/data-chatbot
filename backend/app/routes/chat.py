from fastapi import APIRouter, HTTPException, status, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import logging
import time
import json
from datetime import datetime

from app.models.chat import ChatRequest, ChatResponse, QueryType, SQLQuery, QueryResult
from app.services.auth_service import auth_service
from app.services.openai_service import openai_service
from app.models.auth import SessionData

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

def clean_data_for_json(data: Any) -> Any:
    """Clean data to ensure JSON serialization compatibility"""
    # Check for numpy types without importing numpy
    data_type_name = type(data).__name__
    data_module = getattr(type(data), '__module__', '')
    
    # Handle numpy arrays and scalars
    if 'numpy' in data_module:
        if hasattr(data, 'tolist'):  # numpy array
            return data.tolist()
        elif hasattr(data, 'item'):  # numpy scalar
            return data.item()
    
    # Handle other data types
    if isinstance(data, dict):
        return {k: clean_data_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_data_for_json(item) for item in data]
    elif data is None:
        return None
    else:
        # Convert any non-JSON serializable types to string as fallback
        try:
            json.dumps(data)  # Test if it's JSON serializable
            return data
        except (TypeError, ValueError):
            return str(data)

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> SessionData:
    """Dependency to validate user session"""
    logger.info(f"Chat auth - received token: {credentials.credentials[:10]}...")
    
    session_data = auth_service.validate_session(credentials.credentials)
    
    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session"
        )
    
    return session_data

@router.post("/query", response_model=ChatResponse)
async def process_chat_query(
    chat_request: ChatRequest,
    current_user: SessionData = Depends(get_current_user)
):
    """
    Process natural language query and return SQL results
    
    - **message**: Natural language question (e.g., "Show me top 10 customers")
    - **context**: Optional context for better SQL generation
    """
    start_time = time.time()
    
    try:
        logger.info(f"Processing query from user {current_user.username}: {chat_request.message}")
        
        # Import database service
        from app.services.database_service import database_service
        
        # Step 1: Get real database schema
        schema_info = await database_service.get_database_schema(current_user.metabase_session_id)
        
        # Step 2: Build schema context for OpenAI
        schema_context = database_service.build_schema_context(schema_info)
        
        # Step 3: Get sample data for better context (optional)
        sample_data = {}
        for table in schema_info.get("tables", [])[:3]:  # Limit to first 3 tables for performance
            table_name = table.get("name")
            if table_name:
                sample_data[table_name] = await database_service.get_sample_data(
                    current_user.metabase_session_id, 
                    table_name, 
                    limit=2
                )
        
        # Step 4: Generate SQL query using OpenAI with real schema
        sql_query = await openai_service.generate_sql_query(
            user_question=chat_request.message,
            schema_context=schema_context,
            sample_data=sample_data
        )
        
        # Step 5: Validate SQL safety
        is_safe, safety_message = openai_service.validate_sql_safety(sql_query.query)
        
        if not is_safe:
            processing_time = (time.time() - start_time) * 1000
            return ChatResponse(
                query_type=QueryType.ERROR,
                sql_query=sql_query,
                error_message=f"Unsafe SQL query: {safety_message}",
                processing_time_ms=processing_time,
                timestamp=datetime.utcnow()
            )
        
        # Step 6: Execute SQL against real database
        try:
            query_result = await database_service.execute_sql_query(
                current_user.metabase_session_id,
                sql_query.query
            )
            
            result = QueryResult(
                data=clean_data_for_json(query_result["data"]),
                columns=clean_data_for_json(query_result["columns"]),
                row_count=query_result["row_count"],
                execution_time_ms=query_result["execution_time_ms"]
            )
            
            # Step 6: Let OpenAI decide visualization type
            from app.services.visualization_service import visualization_service
            
            # Get chart suggestion from OpenAI (let AI decide!)
            chart_suggestion = await openai_service.suggest_visualization(
                sql_query.query,
                result.columns,
                result.data[:3]  # Sample data for analysis
            )
            
            # Only create chart if OpenAI suggests one
            chart_data = None
            if chart_suggestion:  # If OpenAI suggests a chart type
                chart_data = await visualization_service.create_visualization(
                    result,
                    chart_suggestion  # Use OpenAI's suggestion
                )
            
            # Create formatted table data (always available)
            table_data = visualization_service.create_formatted_table(result)
            
            processing_time = (time.time() - start_time) * 1000
            
            # Let OpenAI decision determine the response type
            if chart_data:
                response_type = QueryType.CHART
                response_message = f"Found {result.row_count} results. Generated {chart_suggestion.value} chart for visualization."
            else:
                response_type = QueryType.TABLE
                response_message = f"Found {result.row_count} results. Data is best displayed in table format."
            
            return ChatResponse(
                query_type=response_type,
                sql_query=sql_query,
                result=result,
                chart=chart_data,  # Will be None if OpenAI doesn't suggest a chart
                text_response=response_message,
                processing_time_ms=processing_time,
                timestamp=datetime.utcnow()
            )
            
        except Exception as sql_error:
            # SQL execution failed - return the error but still show the generated SQL
            processing_time = (time.time() - start_time) * 1000
            
            return ChatResponse(
                query_type=QueryType.ERROR,
                sql_query=sql_query,
                error_message=f"SQL execution failed: {str(sql_error)}",
                text_response="The SQL was generated but failed to execute. Please check the query syntax.",
                processing_time_ms=processing_time,
                timestamp=datetime.utcnow()
            )
        
    except Exception as e:
        logger.error(f"Error processing chat query: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return ChatResponse(
            query_type=QueryType.ERROR,
            sql_query=SQLQuery(query="", explanation="Query failed"),
            error_message=str(e),
            processing_time_ms=processing_time,
            timestamp=datetime.utcnow()
        )

@router.get("/test")
async def test_chat():
    """Test endpoint to verify chat routes are working"""
    return {
        "message": "Chat service is operational",
        "features": [
            "Natural language to SQL conversion",
            "Query validation and safety checks", 
            "Result formatting and visualization",
            "Metabase integration"
        ]
    }

@router.post("/mock-query")
async def mock_query(chat_request: ChatRequest):
    """
    Mock endpoint to test chat functionality without authentication
    Useful for development and testing
    """
    try:
        # Generate SQL query using OpenAI
        schema_context = """
        Database Schema:
        - customers table: id, name, email, registration_date
        - orders table: id, customer_id, total_amount, order_date
        - products table: id, name, price, category
        - order_items table: order_id, product_id, quantity, price
        """
        
        sql_query = await openai_service.generate_sql_query(
            user_question=chat_request.message,
            schema_context=schema_context
        )
        
        return {
            "user_question": chat_request.message,
            "generated_sql": sql_query.query,
            "explanation": sql_query.explanation,
            "estimated_rows": sql_query.estimated_rows
        }
        
    except Exception as e:
        logger.error(f"Error in mock query: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process query: {str(e)}"
        )