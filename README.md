# SQL Chatbot 🤖💬

A modern, AI-powered chatbot that converts natural language questions into SQL queries using OpenAI's GPT-3.5. Chat with your database using plain English and get instant results with beautiful visualizations.

## ✨ Features

### 🎯 **Core Functionality**
- **Natural Language to SQL**: Convert plain English questions to SQL queries
- **Real-time Database Integration**: Connect directly to your Metabase instance
- **Smart Query Analysis**: AI analyzes database schema and relationships automatically
- **Interactive Results**: View data as tables, charts, or visualizations
- **Query Validation**: Built-in safety checks prevent dangerous SQL operations

### 🎨 **User Experience**
- **Beautiful Dark/Light Mode**: Toggle between themes with smooth transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Chat Interface**: Smooth, flicker-free messaging experience
- **Advanced Table Display**: Horizontal/vertical scrolling with synchronized headers
- **Interactive Charts**: Bar, pie, line, and scatter plots with Recharts
- **Copy SQL Queries**: One-click copy for generated SQL

### 🔒 **Security & Performance**
- **Metabase Authentication**: Secure login through your existing Metabase credentials
- **Session Management**: Secure token-based authentication with auto-expiry
- **Query Safety**: Prevents DELETE, DROP, and other dangerous operations
- **Optimized Rendering**: Zero flickering, memoized components for smooth performance
- **Error Handling**: Comprehensive error management with user-friendly messages

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm/yarn
- **Python** 3.8+ with pip
- **Metabase** instance (cloud or self-hosted)
- **OpenAI API Key**

### 1. Clone the Repository
```bash
git clone https://github.com/nadirsultanli/data-chatbot.git
cd data-chatbot
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Start the Backend
```bash
# In the root directory
python setup.py  # Creates directory structure
uvicorn app.main:app --reload
```

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Metabase Configuration
METABASE_URL=https://your-metabase-instance.com
METABASE_DATABASE_ID=your_database_id

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

### Finding Your Metabase Database ID
1. Login to your Metabase instance
2. Go to Admin → Databases
3. Click on your database
4. The ID is in the URL: `/admin/databases/{ID}`

## 🏗️ Architecture

### Backend (FastAPI + Python)
```
app/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration management
├── models/                # Pydantic models
│   ├── auth.py            # Authentication models
│   └── chat.py            # Chat and query models
├── routes/                # API endpoints
│   ├── auth.py            # Authentication routes
│   ├── chat.py            # Chat and query routes
│   └── schema.py          # Database schema routes
└── services/              # Business logic
    ├── auth_service.py    # Authentication service
    ├── database_service.py # Database operations
    ├── openai_service.py  # OpenAI integration
    └── visualization_service.py # Chart generation
```

### Frontend (React + Tailwind CSS)
```
src/
├── components/
│   ├── auth/
│   │   └── LoginForm.jsx   # Authentication interface
│   └── chat/
│       ├── ChatInterface.jsx # Main chat interface
│       └── ChartRenderer.jsx # Chart visualizations
├── App.js                  # Main application component
└── index.js               # Application entry point
```

## 🎯 Usage Examples

### Natural Language Queries
```
"Show me the top 10 customers by revenue"
→ SELECT customer_name, SUM(total_amount) as revenue 
  FROM orders GROUP BY customer_name ORDER BY revenue DESC LIMIT 10

"How many orders were placed last week?"
→ SELECT COUNT(*) FROM orders 
  WHERE order_date >= CURRENT_DATE - INTERVAL '7 days'

"What's the average order value by month this year?"
→ SELECT DATE_TRUNC('month', order_date) as month, 
  AVG(total_amount) as avg_order_value FROM orders 
  WHERE EXTRACT(year FROM order_date) = EXTRACT(year FROM CURRENT_DATE)
  GROUP BY month ORDER BY month
```

### Supported Query Types
- **Aggregations**: SUM, COUNT, AVG, MIN, MAX
- **Filtering**: WHERE clauses with dates, conditions
- **Grouping**: GROUP BY with multiple dimensions
- **Sorting**: ORDER BY with custom criteria
- **Joins**: Automatic relationship detection
- **Time Series**: Date-based analysis and trends

## 📊 Visualization Features

### Chart Types
- **📊 Bar Charts**: Perfect for comparisons and rankings
- **🥧 Pie Charts**: Great for proportions and distributions
- **📈 Line Charts**: Ideal for trends and time series
- **📉 Scatter Plots**: Useful for correlation analysis

### Smart Chart Selection
The AI automatically determines the best visualization based on:
- Data types (categorical vs numerical)
- Number of data points
- Query intent and structure
- Column relationships

## 🔧 API Endpoints

### Authentication
```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/validate
```

### Chat & Queries
```http
POST /api/chat/query          # Main chat endpoint
POST /api/chat/mock-query     # Development testing
GET  /api/chat/test          # Health check
```

### Database Schema
```http
GET  /api/schema/analyze               # Complete schema analysis
GET  /api/schema/tables               # List all tables
GET  /api/schema/table/{name}/sample  # Sample data from table
```

## 🎨 Styling & Theming

### Dark/Light Mode
The application features a comprehensive theming system:
- **Dark Mode**: Modern dark theme with glass morphism effects
- **Light Mode**: Clean light theme with subtle shadows
- **Smooth Transitions**: Animated theme switching
- **Consistent Design**: All components adapt to the selected theme

### Glass Morphism Design
- Blurred backgrounds with transparency
- Subtle borders and shadows
- Smooth hover animations
- Modern gradient effects

## 🚀 Performance Optimizations

### React Optimizations
- **React.memo**: Prevents unnecessary component re-renders
- **useCallback**: Stable function references
- **useMemo**: Memoized calculations and styles
- **Component Splitting**: Isolated rendering for tables and charts

### Backend Optimizations
- **Async Operations**: Non-blocking database queries
- **Error Handling**: Comprehensive try-catch blocks
- **Session Management**: Efficient token validation
- **Query Caching**: Reduced redundant API calls

## 🔒 Security Features

### SQL Injection Prevention
- Query validation before execution
- Whitelist of allowed SQL operations
- Parameter sanitization
- Read-only query enforcement

### Authentication Security
- Secure session token generation
- Token expiration handling
- Metabase integration for user validation
- CORS protection

## 🐛 Troubleshooting

### Common Issues

**1. "Missing required environment variables"**
```bash
# Check your .env file has all required variables
OPENAI_API_KEY=sk-...
METABASE_URL=https://...
METABASE_DATABASE_ID=...
```

**2. "Unable to connect to Metabase"**
- Verify your Metabase URL is correct
- Check if your Metabase instance is accessible
- Ensure your credentials are valid

**3. "OpenAI API Error"**
- Verify your OpenAI API key is correct
- Check your OpenAI account has sufficient credits
- Ensure API key has proper permissions

**4. Frontend not connecting to backend**
- Backend should be running on `http://localhost:8000`
- Frontend should be running on `http://localhost:3000`
- Check CORS settings in backend configuration

### Debug Mode
```bash
# Enable debug logging
uvicorn app.main:app --reload --log-level debug
```

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/React
- Add tests for new features
- Update documentation for API changes

## 🙏 Acknowledgments

- **OpenAI** for the GPT-3.5 API
- **Metabase** for the database integration platform
- **FastAPI** for the modern Python web framework
- **React** and **Tailwind CSS** for the beautiful frontend
- **Recharts** for the interactive visualizations

### Useful Links
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Metabase API Reference](https://www.metabase.com/docs/latest/api-documentation)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs)