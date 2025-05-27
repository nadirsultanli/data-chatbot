import json
import logging
from typing import Dict, List, Optional, Any
from openai import OpenAI

from app.config import settings
from app.models.chat import SQLQuery, ChartType

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
    
    async def analyze_database_schema(self, schema_info: Dict[str, Any]) -> str:
        """Generate a summary of the database schema for context"""
        try:
            prompt = f"""
            Analyze this database schema and provide a concise summary of the tables, relationships, and key business entities:

            Schema Information:
            {json.dumps(schema_info, indent=2)}

            Provide a brief summary that will help with SQL query generation. Focus on:
            1. Main business entities (users, orders, products, etc.)
            2. Key relationships between tables
            3. Important columns for common queries
            4. Any naming conventions or patterns

            Keep it concise but informative.
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.1
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error analyzing schema: {e}")
            return "Schema analysis not available"
    
    async def generate_sql_query(
        self, 
        user_question: str, 
        schema_context: str,
        sample_data: Optional[Dict[str, List[Dict]]] = None
    ) -> SQLQuery:
        """Convert natural language question to SQL query"""
        try:
            # Build the prompt with schema context
            prompt = self._build_sql_prompt(user_question, schema_context, sample_data)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert SQL query generator. Generate clean, efficient SQL queries based on natural language questions. Always explain your query logic."
                    },
                    {"role": "user", "content": prompt}
                ],
                max_tokens=settings.max_tokens,
                temperature=settings.temperature
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse the response to extract SQL and explanation
            sql_query, explanation = self._parse_sql_response(content)
            
            return SQLQuery(
                query=sql_query,
                explanation=explanation,
                estimated_rows=self._estimate_result_size(sql_query)
            )
            
        except Exception as e:
            logger.error(f"Error generating SQL: {e}")
            raise Exception(f"Failed to generate SQL query: {str(e)}")
    
    async def suggest_visualization(
        self, 
        sql_query: str, 
        column_info: List[str],
        sample_results: Optional[List[Dict]] = None
    ) -> Optional[ChartType]:
        """Let OpenAI suggest the best visualization type for the query results"""
        try:
            prompt = f"""
            Based on this SQL query and its results, determine if this data should be displayed as a chart or table, and if chart, which type:

            SQL Query: {sql_query}
            Columns: {', '.join(column_info)}
            Sample Results: {json.dumps(sample_results[:3] if sample_results else [], indent=2)}

            Guidelines:
            - Use TABLES for: lists of records, detailed data, contact information, individual entries
            - Use CHARTS for: aggregated data, counts, sums, averages, trends, comparisons, analytics

            Examples:
            - Customer names and phones → TABLE
            - Sales by month → LINE chart  
            - Revenue by region → BAR chart
            - Category distribution → PIE chart
            - Performance metrics → SCATTER chart

            If this data should be displayed as a TABLE (not a chart), respond with: "table"
            If this data should be displayed as a chart, respond with one of: "bar", "line", "pie", "scatter", "histogram"

            Respond with just the visualization type, nothing else.
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=50,
                temperature=0.1
            )
            
            suggestion = response.choices[0].message.content.strip().lower()
            
            # If OpenAI suggests "table", return None (no chart)
            if suggestion == "table":
                return None
            
            # Map to ChartType enum
            chart_mapping = {
                "bar": ChartType.BAR,
                "line": ChartType.LINE,
                "pie": ChartType.PIE,
                "scatter": ChartType.SCATTER,
                "histogram": ChartType.HISTOGRAM,
                "area": ChartType.AREA
            }
            
            return chart_mapping.get(suggestion)
            
        except Exception as e:
            logger.error(f"Error suggesting visualization: {e}")
            return None  # Default to table if error
    
    def _build_sql_prompt(
        self, 
        question: str, 
        schema_context: str, 
        sample_data: Optional[Dict[str, List[Dict]]] = None
    ) -> str:
        """Build a comprehensive prompt for SQL generation"""
        
        sample_data_text = ""
        if sample_data:
            sample_data_text = "Sample Data:\n"
            for table, rows in sample_data.items():
                sample_data_text += f"\nTable: {table}\n"
                sample_data_text += json.dumps(rows[:3], indent=2) + "\n"
        
        return f"""
        Generate a SQL query to answer this question: "{question}"

        Database Schema Context:
        {schema_context}

        {sample_data_text}

        Requirements:
        1. Generate clean, efficient SQL
        2. Use proper table and column names from the schema
        3. Handle potential NULL values appropriately
        4. Add helpful comments if the query is complex
        5. Limit results to reasonable numbers (add LIMIT if needed)

        Format your response as:
        
        SQL:
        ```sql
        YOUR_SQL_QUERY_HERE
        ```
        
        EXPLANATION:
        Brief explanation of what the query does and why you chose this approach.
        """
    
    def _parse_sql_response(self, content: str) -> tuple[str, str]:
        """Parse OpenAI response to extract SQL query and explanation"""
        try:
            # Extract SQL query
            sql_start = content.find("```sql")
            sql_end = content.find("```", sql_start + 6)
            
            if sql_start != -1 and sql_end != -1:
                sql_query = content[sql_start + 6:sql_end].strip()
            else:
                # Fallback: look for SQL: section
                lines = content.split('\n')
                sql_lines = []
                in_sql = False
                
                for line in lines:
                    if line.strip().upper().startswith('SQL:'):
                        in_sql = True
                        continue
                    elif line.strip().upper().startswith('EXPLANATION:'):
                        break
                    elif in_sql:
                        sql_lines.append(line)
                
                sql_query = '\n'.join(sql_lines).strip()
            
            # Extract explanation
            explanation_start = content.find("EXPLANATION:")
            if explanation_start != -1:
                explanation = content[explanation_start + 12:].strip()
            else:
                explanation = "SQL query generated successfully"
            
            return sql_query, explanation
            
        except Exception as e:
            logger.error(f"Error parsing SQL response: {e}")
            return content, "Generated query"
    
    def _estimate_result_size(self, sql_query: str) -> Optional[int]:
        """Estimate the number of rows the query might return"""
        query_lower = sql_query.lower()
        
        # Simple heuristics
        if "count(" in query_lower and "group by" not in query_lower:
            return 1
        elif "group by" in query_lower:
            return 50  # Estimate for grouped data
        elif "limit" in query_lower:
            try:
                # Extract limit value
                limit_pos = query_lower.rfind("limit")
                limit_part = sql_query[limit_pos:].split()[1]
                return int(limit_part.split(';')[0])
            except:
                return 100
        else:
            return 1000  # Default estimate
    
    def validate_sql_safety(self, sql_query: str) -> tuple[bool, str]:
        """Basic validation to ensure SQL is safe (read-only)"""
        dangerous_keywords = [
            'drop ', 'delete ', 'update ', 'insert ', 'alter ', 
            'create ', 'truncate ', 'grant ', 'revoke '
        ]
        
        query_lower = sql_query.lower().strip()
        
        # Check for dangerous keywords as whole words (with spaces)
        for keyword in dangerous_keywords:
            if keyword in query_lower:
                # Additional check: make sure it's not part of a column name
                # Skip if it's part of created_at, updated_at, etc.
                if keyword.strip() == 'create' and ('created_at' in query_lower or 'create_' in query_lower):
                    continue
                if keyword.strip() == 'update' and ('updated_at' in query_lower or 'update_' in query_lower):
                    continue
                if keyword.strip() == 'delete' and ('deleted_at' in query_lower or 'delete_' in query_lower):
                    continue
                    
                return False, f"Dangerous SQL keyword detected: {keyword.strip()}"
        
        # Should start with SELECT
        if not query_lower.startswith('select'):
            return False, "Only SELECT queries are allowed"
        
        return True, "Query is safe"

# Global service instance
openai_service = OpenAIService()