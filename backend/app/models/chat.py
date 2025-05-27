from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum

class QueryType(str, Enum):
    TABLE = "table"
    CHART = "chart"
    TEXT = "text"
    ERROR = "error"

class ChartType(str, Enum):
    BAR = "bar"
    LINE = "line"
    PIE = "pie"
    SCATTER = "scatter"
    HISTOGRAM = "histogram"
    AREA = "area"

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None  # Optional context for better SQL generation

class SQLQuery(BaseModel):
    query: str
    explanation: str
    estimated_rows: Optional[int] = None

class QueryResult(BaseModel):
    data: List[Dict[str, Any]]
    columns: List[str]
    row_count: int
    execution_time_ms: float

class ChartData(BaseModel):
    chart_type: ChartType
    data: Dict[str, Any]  # Plotly-compatible data structure
    title: str
    description: Optional[str] = None

class ChatResponse(BaseModel):
    query_type: QueryType
    sql_query: SQLQuery
    result: Optional[QueryResult] = None
    chart: Optional[ChartData] = None
    text_response: Optional[str] = None
    error_message: Optional[str] = None
    processing_time_ms: float
    timestamp: datetime

class ErrorResponse(BaseModel):
    error_type: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime

class DatabaseSchema(BaseModel):
    table_name: str
    columns: List[Dict[str, str]]  # [{"name": "col1", "type": "varchar", "nullable": True}]
    primary_keys: List[str]
    foreign_keys: List[Dict[str, str]]  # [{"column": "user_id", "references": "users.id"}]
    sample_data: Optional[List[Dict[str, Any]]] = None

class SchemaAnalysis(BaseModel):
    tables: List[DatabaseSchema]
    relationships: List[Dict[str, str]]  # Table relationships
    summary: str  # AI-generated summary of the database structure