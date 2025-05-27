import httpx
import logging
from typing import Dict, List, Optional, Any
import json

from app.config import settings
from app.models.chat import DatabaseSchema

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.metabase_url = settings.metabase_url.rstrip('/')
        self.database_id = settings.metabase_database_id
    
    async def get_database_schema(self, metabase_session_id: str) -> Dict[str, Any]:
        """Get complete database schema from Metabase"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                # Get database metadata
                database_response = await client.get(
                    f"{self.metabase_url}/api/database/{self.database_id}",
                    headers={"X-Metabase-Session": metabase_session_id}
                )
                
                if database_response.status_code != 200:
                    raise Exception(f"Failed to get database info: {database_response.status_code}")
                
                database_info = database_response.json()
                
                # Get all tables
                tables_response = await client.get(
                    f"{self.metabase_url}/api/database/{self.database_id}/metadata",
                    headers={"X-Metabase-Session": metabase_session_id}
                )
                
                if tables_response.status_code != 200:
                    raise Exception(f"Failed to get tables: {tables_response.status_code}")
                
                metadata = tables_response.json()
                
                # Process schema information
                schema_info = {
                    "database_name": database_info.get("name"),
                    "database_type": database_info.get("engine"),
                    "tables": []
                }
                
                for table in metadata.get("tables", []):
                    table_info = await self._process_table_info(table, metabase_session_id)
                    if table_info:
                        schema_info["tables"].append(table_info)
                
                logger.info(f"Retrieved schema for {len(schema_info['tables'])} tables")
                return schema_info
                
        except Exception as e:
            logger.error(f"Error getting database schema: {e}")
            raise Exception(f"Failed to retrieve database schema: {str(e)}")
    
    async def _process_table_info(self, table: Dict, metabase_session_id: str) -> Optional[Dict]:
        """Process individual table information"""
        try:
            table_info = {
                "name": table.get("name"),
                "display_name": table.get("display_name"),
                "schema": table.get("schema"),
                "columns": [],
                "primary_keys": [],
                "foreign_keys": [],
                "row_count": table.get("rows")
            }
            
            # Process columns
            for field in table.get("fields", []):
                column_info = {
                    "name": field.get("name"),
                    "display_name": field.get("display_name"),
                    "type": field.get("base_type"),
                    "database_type": field.get("database_type"),
                    "nullable": not field.get("database_required", False),
                    "description": field.get("description")
                }
                
                # Check for primary key
                if field.get("semantic_type") == "type/PK":
                    table_info["primary_keys"].append(field.get("name"))
                
                # Check for foreign key
                if field.get("semantic_type") == "type/FK":
                    fk_info = {
                        "column": field.get("name"),
                        "references": field.get("fk_target_field_id")  # We'll resolve this later
                    }
                    table_info["foreign_keys"].append(fk_info)
                
                table_info["columns"].append(column_info)
            
            return table_info
            
        except Exception as e:
            logger.error(f"Error processing table {table.get('name')}: {e}")
            return None
    
    async def get_sample_data(self, metabase_session_id: str, table_name: str, limit: int = 3) -> List[Dict]:
        """Get sample data from a specific table"""
        try:
            # Create a simple query to get sample data
            query = {
                "database": int(self.database_id),
                "type": "native",
                "native": {
                    "query": f"SELECT * FROM {table_name} LIMIT {limit}"
                }
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.metabase_url}/api/dataset",
                    headers={
                        "X-Metabase-Session": metabase_session_id,
                        "Content-Type": "application/json"
                    },
                    json=query
                )
                
                if response.status_code != 200:
                    logger.warning(f"Failed to get sample data for {table_name}: {response.status_code}")
                    return []
                
                result = response.json()
                
                # Parse the result
                columns = [col["name"] for col in result.get("data", {}).get("cols", [])]
                rows = result.get("data", {}).get("rows", [])
                
                # Convert to list of dictionaries
                sample_data = []
                for row in rows:
                    row_dict = dict(zip(columns, row))
                    sample_data.append(row_dict)
                
                return sample_data
                
        except Exception as e:
            logger.error(f"Error getting sample data for {table_name}: {e}")
            return []
    
    def clean_data_for_serialization(self, data: Any) -> Any:
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
            return {k: self.clean_data_for_serialization(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.clean_data_for_serialization(item) for item in data]
        elif data is None:
            return None
        else:
            # Convert any non-JSON serializable types to string as fallback
            try:
                json.dumps(data)  # Test if it's JSON serializable
                return data
            except (TypeError, ValueError):
                return str(data)
    
    async def execute_sql_query(self, metabase_session_id: str, sql_query: str) -> Dict[str, Any]:
        """Execute SQL query via Metabase and return results"""
        try:
            query = {
                "database": int(self.database_id),
                "type": "native",
                "native": {
                    "query": sql_query
                }
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.metabase_url}/api/dataset",
                    headers={
                        "X-Metabase-Session": metabase_session_id,
                        "Content-Type": "application/json"
                    },
                    json=query
                )
                
                # Accept both 200 (immediate) and 202 (async) responses
                if response.status_code not in [200, 202]:
                    error_detail = response.text
                    raise Exception(f"HTTP {response.status_code}: {error_detail}")
                
                result = response.json()
                logger.info(f"Metabase response status: {result.get('status')} (HTTP {response.status_code})")
                
                # Check for query errors - look for explicit error or failed status
                if result.get("status") == "failed":
                    error_msg = result.get("error", "Unknown SQL error")
                    raise Exception(f"SQL Error: {error_msg}")
                
                # Check if we have an explicit error field
                if result.get("error"):
                    raise Exception(f"SQL Error: {result.get('error')}")
                
                # Parse successful result
                data = result.get("data", {})
                
                # Get columns - try both paths for column metadata
                cols_metadata = data.get("cols", [])
                if not cols_metadata:
                    # Fallback to results_metadata if cols is empty
                    results_metadata = data.get("results_metadata", {})
                    cols_metadata = results_metadata.get("columns", [])
                
                columns = []
                for col in cols_metadata:
                    col_name = col.get("display_name") or col.get("name", "unknown")
                    columns.append(col_name)
                
                # Get rows data
                rows = data.get("rows", [])
                
                # Convert to list of dictionaries
                result_data = []
                for row in rows:
                    if len(columns) > 0:
                        # Convert each value to ensure JSON serialization
                        clean_row = []
                        for value in row:
                            # Convert numpy types to Python types
                            if hasattr(value, 'item'):  # numpy scalar
                                clean_row.append(value.item())
                            elif hasattr(value, 'tolist'):  # numpy array
                                clean_row.append(value.tolist())
                            elif value is None:
                                clean_row.append(None)
                            else:
                                clean_row.append(value)
                        
                        row_dict = dict(zip(columns, clean_row))
                    else:
                        # Fallback if no column metadata
                        clean_row = []
                        for i, value in enumerate(row):
                            if hasattr(value, 'item'):  # numpy scalar
                                clean_row.append(value.item())
                            elif hasattr(value, 'tolist'):  # numpy array
                                clean_row.append(value.tolist())
                            elif value is None:
                                clean_row.append(None)
                            else:
                                clean_row.append(value)
                        
                        row_dict = {f"column_{i}": value for i, value in enumerate(clean_row)}
                        columns = [f"column_{i}" for i in range(len(clean_row))]
                    
                    result_data.append(row_dict)
                
                logger.info(f"Successfully parsed {len(result_data)} rows with {len(columns)} columns")
                
                # Clean all data for JSON serialization
                clean_result = {
                    "data": self.clean_data_for_serialization(result_data),
                    "columns": self.clean_data_for_serialization(columns),
                    "row_count": len(result_data),
                    "execution_time_ms": result.get("running_time", 0)
                }
                
                return clean_result
                
        except Exception as e:
            # Log the actual error for debugging
            logger.error(f"Error executing SQL query: {str(e)}")
            # Don't include the full JSON in the error message
            if any(prefix in str(e) for prefix in ["SQL Error:", "HTTP"]):
                raise e  # Re-raise if it's already our formatted error
            else:
                raise Exception(f"Database query failed: {str(e)[:200]}...")  # Truncate long errors
    
    def build_schema_context(self, schema_info: Dict[str, Any]) -> str:
        """Build a comprehensive schema context string for OpenAI"""
        context_parts = []
        
        context_parts.append(f"Database: {schema_info.get('database_name')} ({schema_info.get('database_type')})")
        context_parts.append("\nTables and Schema:")
        
        for table in schema_info.get("tables", []):
            table_name = table.get("name")
            display_name = table.get("display_name", table_name)
            row_count = table.get("row_count", "unknown")
            
            context_parts.append(f"\n{table_name} ({display_name}) - {row_count} rows:")
            
            # Add columns
            for col in table.get("columns", []):
                col_name = col.get("name")
                col_type = col.get("database_type", col.get("type", "unknown"))
                nullable = "NULL" if col.get("nullable", True) else "NOT NULL"
                description = col.get("description", "")
                
                col_desc = f"  - {col_name}: {col_type} {nullable}"
                if description:
                    col_desc += f" ({description})"
                context_parts.append(col_desc)
            
            # Add primary keys
            if table.get("primary_keys"):
                context_parts.append(f"  Primary Keys: {', '.join(table['primary_keys'])}")
            
            # Add foreign keys
            if table.get("foreign_keys"):
                fk_list = [f"{fk['column']}" for fk in table["foreign_keys"]]
                context_parts.append(f"  Foreign Keys: {', '.join(fk_list)}")
        
        return "\n".join(context_parts)
    
    async def get_table_relationships(self, schema_info: Dict[str, Any]) -> List[Dict[str, str]]:
        """Extract table relationships from schema"""
        relationships = []
        
        for table in schema_info.get("tables", []):
            table_name = table.get("name")
            
            for fk in table.get("foreign_keys", []):
                # This is a simplified relationship mapping
                # In a real implementation, you'd resolve the FK target field ID
                relationships.append({
                    "from_table": table_name,
                    "from_column": fk.get("column"),
                    "to_table": "unknown",  # Would need to resolve FK target
                    "to_column": "unknown"
                })
        
        return relationships

# Global service instance
database_service = DatabaseService()