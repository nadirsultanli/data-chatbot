import logging
from typing import Dict, List, Any, Optional
import json

from app.models.chat import ChartData, QueryResult, ChartType

logger = logging.getLogger(__name__)

class VisualizationService:
    
    def __init__(self):
        self.max_categories = 15
        self.max_rows_for_display = 100
    
    async def create_visualization(
        self, 
        query_result: QueryResult, 
        suggested_chart_type: Optional[ChartType] = None
    ) -> Optional[ChartData]:
        """Create visualization data structure based on suggested chart type"""
        try:
            if not query_result.data or not suggested_chart_type:
                return None
            
            # Create chart data structure using the suggested type
            chart_data = self._create_chart_data(query_result, suggested_chart_type)
            
            return chart_data
            
        except Exception as e:
            logger.error(f"Error creating visualization: {e}")
            return None
    
    def _analyze_data_for_chart_type(self, query_result: QueryResult) -> ChartType:
        """Smart analysis to suggest appropriate display type"""
        if not query_result.data or len(query_result.data) == 0:
            return ChartType.BAR
        
        first_row = query_result.data[0]
        columns = query_result.columns
        
        # Count numeric vs text columns
        numeric_cols = []
        text_cols = []
        date_cols = []
        
        for col in columns:
            sample_value = first_row.get(col)
            
            # Check if it's a date/timestamp
            if isinstance(sample_value, str) and any(keyword in col.lower() for keyword in ['date', 'time', 'created', 'updated']):
                date_cols.append(col)
            elif isinstance(sample_value, (int, float)) and not isinstance(sample_value, bool):
                numeric_cols.append(col)
            else:
                text_cols.append(col)
        
        # Decision logic for appropriate visualization
        
        # If it's mostly text data (like names, phones, addresses), prefer table
        if len(text_cols) >= 2 and len(numeric_cols) == 0:
            # This is likely descriptive data (names, phones, emails, etc.)
            # Should be displayed as a table, not a chart
            return None  # Return None to indicate table-only display
        
        # If we have aggregatable data (categories + numbers), use charts
        if len(text_cols) >= 1 and len(numeric_cols) >= 1:
            # Check if suitable for pie chart (few categories)
            if len(text_cols) == 1:
                unique_values = set()
                for row in query_result.data:
                    unique_values.add(row.get(text_cols[0]))
                    if len(unique_values) > 8:  # Too many categories for pie
                        break
                
                if len(unique_values) <= 8:
                    return ChartType.PIE
            
            return ChartType.BAR
        elif len(numeric_cols) >= 2:
            return ChartType.SCATTER
        else:
            return ChartType.BAR
    
    def _create_chart_data(self, query_result: QueryResult, chart_type: ChartType) -> ChartData:
        """Create chart data structure for frontend rendering"""
        
        if chart_type == ChartType.BAR:
            chart_data = self._create_bar_data(query_result)
        elif chart_type == ChartType.PIE:
            chart_data = self._create_pie_data(query_result)
        elif chart_type == ChartType.SCATTER:
            chart_data = self._create_scatter_data(query_result)
        else:
            chart_data = self._create_bar_data(query_result)  # Default
        
        return ChartData(
            chart_type=chart_type,
            data=chart_data,
            title=f"{chart_type.value.title()} Chart",
            description=f"Showing {len(query_result.data)} records"
        )
    
    def _create_bar_data(self, query_result: QueryResult) -> Dict[str, Any]:
        """Create bar chart data structure"""
        columns = query_result.columns
        data = query_result.data
        
        # Find first text column and first numeric column
        text_col = None
        numeric_col = None
        
        for col in columns:
            if text_col is None:
                sample_val = data[0].get(col) if data else None
                if isinstance(sample_val, str):
                    text_col = col
            
            if numeric_col is None:
                sample_val = data[0].get(col) if data else None
                if isinstance(sample_val, (int, float)) and not isinstance(sample_val, bool):
                    numeric_col = col
            
            if text_col and numeric_col:
                break
        
        # If no suitable columns found, use first two columns
        if not text_col:
            text_col = columns[0] if columns else "category"
        if not numeric_col:
            numeric_col = columns[1] if len(columns) > 1 else columns[0] if columns else "value"
        
        # Aggregate data
        aggregated = {}
        for row in data:
            key = str(row.get(text_col, "Unknown"))
            value = row.get(numeric_col, 0)
            
            # Convert to number if possible
            try:
                value = float(value) if value is not None else 0
            except (TypeError, ValueError):
                value = 1  # Count occurrences if not numeric
            
            if key in aggregated:
                aggregated[key] += value
            else:
                aggregated[key] = value
        
        # Limit categories
        if len(aggregated) > self.max_categories:
            # Take top categories by value
            sorted_items = sorted(aggregated.items(), key=lambda x: x[1], reverse=True)
            aggregated = dict(sorted_items[:self.max_categories])
        
        return {
            "labels": list(aggregated.keys()),
            "values": list(aggregated.values()),
            "x_label": text_col,
            "y_label": numeric_col
        }
    
    def _create_pie_data(self, query_result: QueryResult) -> Dict[str, Any]:
        """Create pie chart data structure"""
        bar_data = self._create_bar_data(query_result)
        
        return {
            "labels": bar_data["labels"],
            "values": bar_data["values"],
            "total": sum(bar_data["values"])
        }
    
    def _create_scatter_data(self, query_result: QueryResult) -> Dict[str, Any]:
        """Create scatter plot data structure"""
        columns = query_result.columns
        data = query_result.data
        
        # Find two numeric columns
        numeric_cols = []
        for col in columns:
            sample_val = data[0].get(col) if data else None
            if isinstance(sample_val, (int, float)) and not isinstance(sample_val, bool):
                numeric_cols.append(col)
            if len(numeric_cols) >= 2:
                break
        
        # Use first two columns if no numeric columns found
        if len(numeric_cols) < 2:
            numeric_cols = columns[:2] if len(columns) >= 2 else columns + ["value"]
        
        x_col = numeric_cols[0]
        y_col = numeric_cols[1] if len(numeric_cols) > 1 else numeric_cols[0]
        
        x_values = []
        y_values = []
        
        for row in data:
            x_val = row.get(x_col, 0)
            y_val = row.get(y_col, 0)
            
            # Convert to numbers
            try:
                x_val = float(x_val) if x_val is not None else 0
                y_val = float(y_val) if y_val is not None else 0
            except (TypeError, ValueError):
                x_val = 0
                y_val = 0
            
            x_values.append(x_val)
            y_values.append(y_val)
        
        return {
            "x_values": x_values,
            "y_values": y_values,
            "x_label": x_col,
            "y_label": y_col
        }
    
    def create_formatted_table(self, query_result: QueryResult) -> Dict[str, Any]:
        """Create formatted table data for display"""
        try:
            # Limit rows for display
            display_data = query_result.data[:self.max_rows_for_display]
            
            # Format data for better display
            formatted_rows = []
            for row in display_data:
                formatted_row = {}
                for col, value in row.items():
                    # Format different data types
                    if value is None:
                        formatted_row[col] = "N/A"
                    elif isinstance(value, bool):
                        formatted_row[col] = "Yes" if value else "No"
                    elif isinstance(value, float):
                        formatted_row[col] = round(value, 2)
                    else:
                        formatted_row[col] = str(value)
                formatted_rows.append(formatted_row)
            
            # Create column definitions
            columns_def = []
            for col in query_result.columns:
                columns_def.append({
                    "field": col,
                    "headerName": col.replace("_", " ").title(),
                    "sortable": True,
                    "width": 150
                })
            
            return {
                "columns": columns_def,
                "rows": formatted_rows,
                "total_rows": query_result.row_count,
                "displayed_rows": len(formatted_rows),
                "has_more": query_result.row_count > len(formatted_rows)
            }
            
        except Exception as e:
            logger.error(f"Error creating formatted table: {e}")
            return {
                "columns": [],
                "rows": [],
                "total_rows": 0,
                "error": str(e)
            }

# Global service instance
visualization_service = VisualizationService()