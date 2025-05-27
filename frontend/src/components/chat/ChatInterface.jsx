import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Database, 
  BarChart3, 
  Table, 
  Code, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  LogOut,
  User,
  Bot,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import ChartRenderer from './ChartRenderer';

const ChatInterface = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('sessionToken');
      const response = await fetch('http://localhost:8000/api/chat/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputMessage,
          context: null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.detail || 'Failed to process query');
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: error.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const LoadingDots = () => (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  const UserMessage = ({ message }) => (
    <div className="flex justify-end mb-4 group">
      <div className="flex items-end space-x-2 max-w-2xl">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
        </div>
        <div className="bg-black text-white px-4 py-3 rounded-2xl rounded-br-md shadow-sm">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );

  const BotMessage = ({ message }) => {
    const data = message.content;
    
    return (
      <div className="flex justify-start mb-6 group">
        <div className="flex items-start space-x-3 max-w-4xl w-full">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Bot className="w-4 h-4 text-gray-700" />
          </div>
          
          <div className="flex-1 space-y-4">
            {/* Response Text */}
            {data.text_response && (
              <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-md">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-800 leading-relaxed">{data.text_response}</p>
                </div>
              </div>
            )}

            {/* SQL Query Display */}
            {data.sql_query?.query && (
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Generated SQL</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(data.sql_query.query)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {data.sql_query.query}
                  </pre>
                  {data.sql_query.explanation && (
                    <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                      {data.sql_query.explanation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Results Display */}
            {data.result && data.query_type === 'table' && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <Table className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Results ({data.result.row_count} rows)
                  </span>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {data.result.columns.map((col, idx) => (
                          <th key={idx} className="text-left p-3 text-gray-700 font-medium">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.result.data.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          {data.result.columns.map((col, colIdx) => (
                            <td key={colIdx} className="p-3 text-gray-800">
                              {row[col] !== null ? String(row[col]) : (
                                <span className="text-gray-400 italic">null</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.result.row_count > 10 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Showing first 10 of {data.result.row_count} results
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chart Display */}
            {data.chart && data.query_type === 'chart' && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <BarChart3 className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Chart: {data.chart.chart_type}
                  </span>
                </div>
                <div className="p-4">
                  <ChartRenderer chartData={data.chart} />
                </div>
              </div>
            )}

            {/* Error Display */}
            {data.error_message && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Query Error</p>
                    <p className="text-sm text-red-700 mt-1 leading-relaxed">{data.error_message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Processing Time */}
            <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-xs text-gray-500">
                {formatTime(message.timestamp)}
              </span>
              {data.processing_time_ms && (
                <span className="text-xs text-gray-500">
                  {Math.round(data.processing_time_ms)}ms
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ErrorMessage = ({ message }) => (
    <div className="flex justify-start mb-6 group">
      <div className="flex items-start space-x-3 max-w-2xl">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <AlertCircle className="w-4 h-4 text-red-600" />
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tl-md px-4 py-3">
          <p className="text-sm text-red-800 leading-relaxed">{message.content}</p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2">
            <span className="text-xs text-red-600">{formatTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Ask me anything about your data
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          I'll analyze your database and generate SQL queries to get you the insights you need.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="bg-gray-50 rounded-lg p-3 text-left">
            <span className="font-medium">Try asking:</span>
            <div className="mt-1 space-y-1">
              <div>"Show me the top 10 customers by revenue"</div>
              <div>"What are our sales by month this year?"</div>
              <div>"How many orders were placed last week?"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">SQL Assistant</h1>
                <p className="text-sm text-gray-600">Chat with your database</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.user_info.username}</p>
                <p className="text-xs text-gray-500">Connected</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-1">
              {messages.map((message) => {
                if (message.type === 'user') {
                  return <UserMessage key={message.id} message={message} />;
                } else if (message.type === 'error') {
                  return <ErrorMessage key={message.id} message={message} />;
                } else {
                  return <BotMessage key={message.id} message={message} />;
                }
              })}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-gray-700" />
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-md">
                      <LoadingDots />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white sticky bottom-0">
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your data..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              rows="1"
              disabled={isLoading}
              style={{
                minHeight: '44px',
                maxHeight: '120px'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:bg-gray-400"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;