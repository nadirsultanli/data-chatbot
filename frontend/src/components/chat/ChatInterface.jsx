import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Moon,
  Sun
} from 'lucide-react';
import ChartRenderer from './ChartRenderer';

const ChatInterface = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Memoized functions to prevent re-renders
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
  }, []);

  const formatTime = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Effects with stable dependencies
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]); // Only when message count changes

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async () => {
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
  }, [inputMessage, isLoading]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Memoized style object to prevent re-renders
  const dynamicStyles = useMemo(() => ({
    chatApp: isDarkMode ? 'dark-mode' : 'light-mode'
  }), [isDarkMode]);

  return (
    <div className={`chat-app ${dynamicStyles.chatApp}`}>
      {/* All your existing styles stay exactly the same */}
      <style>{`
        .chat-app {
          height: 100vh;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          width: 100%;
          overflow: hidden;
        }

        .light-mode {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%);
          color: #1f2937;
        }

        .dark-mode {
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #0f0f0f 100%);
          color: #ffffff;
        }

        .glass-header {
          backdrop-filter: blur(10px);
          background: ${isDarkMode 
            ? 'rgba(26, 26, 26, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)'};
          border-bottom: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'};
          position: sticky;
          top: 0;
          z-index: 10;
          flex-shrink: 0;
        }

        .glass-panel {
          background: ${isDarkMode 
            ? 'linear-gradient(145deg, rgba(42, 42, 42, 0.6), rgba(26, 26, 26, 0.6))' 
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))'};
          backdrop-filter: blur(10px);
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 15px;
          padding: 16px;
          box-shadow: ${isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)'};
          transition: all 0.3s ease;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }

        .glass-panel:hover {
          transform: translateY(-2px);
          box-shadow: ${isDarkMode 
            ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
            : '0 12px 40px rgba(0, 0, 0, 0.15)'};
        }

        .constrained-table-container {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          border-radius: 12px;
          background: ${isDarkMode 
            ? 'rgba(0, 0, 0, 0.2)' 
            : 'rgba(248, 250, 252, 0.8)'};
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'};
        }

        .table-header-container {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          background: ${isDarkMode 
            ? 'rgba(42, 42, 42, 0.95)' 
            : 'rgba(248, 250, 252, 0.95)'};
          backdrop-filter: blur(10px);
          border-bottom: 2px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.15)' 
            : 'rgba(0, 0, 0, 0.15)'};
        }

        .table-header-container::-webkit-scrollbar {
          height: 1px;
          background: transparent;
        }

        .table-header-container::-webkit-scrollbar-thumb {
          background: transparent;
        }

        .table-body-scroll {
          width: 100%;
          overflow-x: auto;
          overflow-y: auto;
          min-height: 150px;
          max-height: 350px;
          overscroll-behavior: contain;
        }

        .table-body-scroll::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }

        .table-body-scroll::-webkit-scrollbar-track {
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 4px;
        }

        .table-body-scroll::-webkit-scrollbar-thumb {
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(0, 0, 0, 0.2)'};
          border-radius: 4px;
        }

        .table-body-scroll::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.3)' 
            : 'rgba(0, 0, 0, 0.3)'};
        }

        .table-body-scroll::-webkit-scrollbar-corner {
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)'};
        }

        .data-table {
          border-collapse: separate;
          border-spacing: 0;
          font-size: 13px;
          line-height: 1.4;
          table-layout: auto;
          width: max-content;
        }

        .table-header-container .data-table,
        .table-body-scroll .data-table {
          table-layout: auto;
          width: max-content;
        }

        .table-header-cell,
        .table-cell {
          min-width: 120px;
          max-width: 300px;
          width: auto;
          box-sizing: border-box;
        }

        .table-header-cell {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 0.5px;
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};
          border-right: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)'};
          white-space: nowrap;
          overflow: visible;
        }

        .table-cell {
          padding: 10px 16px;
          border-bottom: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)'};
          border-right: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)'};
          vertical-align: top;
          overflow: hidden;
        }

        .cell-content {
          display: block;
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'};
          width: 100%;
          white-space: normal;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .table-row {
          transition: all 0.2s ease;
        }

        .table-row:hover {
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.03)'};
        }

        .table-row:nth-child(even) {
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.02)' 
            : 'rgba(0, 0, 0, 0.02)'};
        }

        .null-value {
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'};
          font-style: italic;
          font-size: 12px;
        }

        .table-footer {
          background: ${isDarkMode 
            ? 'rgba(42, 42, 42, 0.8)' 
            : 'rgba(248, 250, 252, 0.9)'};
          border-top: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'};
          padding: 10px 16px;
        }

        .table-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .glass-message {
          background: ${isDarkMode 
            ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))' 
            : 'linear-gradient(145deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8))'};
          backdrop-filter: blur(10px);
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(255, 255, 255, 0.1)'};
          border-radius: 20px;
          padding: 12px 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .user-message {
          color: ${isDarkMode ? '#ffffff' : '#ffffff'};
          border-bottom-right-radius: 8px;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 4px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .user-avatar {
          background: linear-gradient(145deg, #000000, #1a1a1a);
          color: white;
        }

        .bot-avatar {
          background: ${isDarkMode 
            ? 'linear-gradient(145deg, rgba(42, 42, 42, 0.8), rgba(26, 26, 26, 0.8))' 
            : 'linear-gradient(145deg, #f1f5f9, #e2e8f0)'};
          color: ${isDarkMode ? '#ffffff' : '#374151'};
        }

        .error-avatar {
          background: linear-gradient(145deg, #fee2e2, #fecaca);
          color: #dc2626;
        }

        .code-block {
          background: ${isDarkMode 
            ? 'rgba(0, 0, 0, 0.4)' 
            : 'rgba(248, 250, 252, 0.8)'};
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'};
          border-radius: 8px;
          padding: 12px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          overflow-x: auto;
        }

        .error-panel {
          background: ${isDarkMode 
            ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))' 
            : 'linear-gradient(145deg, rgba(254, 242, 242, 0.9), rgba(254, 226, 226, 0.9))'};
          border: 1px solid ${isDarkMode 
            ? 'rgba(239, 68, 68, 0.3)' 
            : 'rgba(239, 68, 68, 0.2)'};
        }

        .glass-button {
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)'};
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(0, 0, 0, 0.1)'};
          border-radius: 6px;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .glass-button:hover {
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(0, 0, 0, 0.1)'};
          transform: translateY(-1px);
        }

        .glass-input-container {
          background: ${isDarkMode 
            ? 'rgba(26, 26, 26, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)'};
          backdrop-filter: blur(10px);
          border-top: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'};
          position: sticky;
          bottom: 0;
          flex-shrink: 0;
        }

        .glass-input-wrapper {
          background: ${isDarkMode 
            ? 'linear-gradient(145deg, rgba(42, 42, 42, 0.6), rgba(26, 26, 26, 0.6))' 
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))'};
          backdrop-filter: blur(10px);
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(0, 0, 0, 0.1)'};
          border-radius: 25px;
          padding: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: ${isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)'};
        }

        .glass-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 12px 16px;
          font-size: 14px;
          border-radius: 20px;
          outline: none;
          color: ${isDarkMode ? '#ffffff' : '#1f2937'};
          resize: none;
          min-height: 44px;
          max-height: 120px;
        }

        .glass-input::placeholder {
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
        }

        .send-button {
          background: linear-gradient(145deg, #000000, #1a1a1a);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .empty-state-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: ${isDarkMode 
            ? 'linear-gradient(145deg, rgba(42, 42, 42, 0.6), rgba(26, 26, 26, 0.6))' 
            : 'linear-gradient(145deg, rgba(248, 250, 252, 0.9), rgba(226, 232, 240, 0.9))'};
          backdrop-filter: blur(10px);
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: ${isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)'};
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
        }

        .gradient-text {
          background: ${isDarkMode 
            ? 'linear-gradient(to right, #ffffff, #d1d5db)' 
            : 'linear-gradient(to right, #1f2937, #6b7280)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .animate-slide-up {
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .simple-loading {
          background: ${isDarkMode 
            ? 'linear-gradient(145deg, rgba(42, 42, 42, 0.6), rgba(26, 26, 26, 0.6))' 
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))'};
          backdrop-filter: blur(10px);
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 20px;
          border-top-left-radius: 8px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: ${isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)'};
        }

        .loading-dots {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .loading-dot {
          width: 6px;
          height: 6px;
          background: ${isDarkMode ? '#ffffff' : '#6b7280'};
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite both;
        }

        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        .loading-dot:nth-child(3) { animation-delay: 0s; }

        .loading-text {
          font-size: 14px;
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
          font-weight: 500;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0;
        }
      `}</style>

      {/* Header */}
      <div className="glass-header">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-white to-gray-300 text-black' 
                  : 'bg-gradient-to-br from-black to-gray-800 text-white'
              }`}>
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">SQL Assistant</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Chat with your database using natural language
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="glass-button p-2"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <div className="text-right">
                <p className="text-sm font-medium">{user.user_info.username}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Connected</p>
              </div>
              
              <button
                onClick={onLogout}
                className="glass-button p-2"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        <div className="px-6 py-8 w-full">
          {messages.length === 0 ? (
            <EmptyState isDarkMode={isDarkMode} />
          ) : (
            <MessagesList 
              messages={messages} 
              isDarkMode={isDarkMode}
              formatTime={formatTime}
              copyToClipboard={copyToClipboard}
            />
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="flex items-start space-x-3">
                <div className="avatar bot-avatar">
                  <Bot className="w-4 h-4" />
                </div>
                <SimpleLoading />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="glass-input-container">
        <div className="px-6 py-6 w-full">
          <div className="glass-input-wrapper">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your data..."
              className="glass-input"
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className={`text-xs text-center mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

// Memoized Loading Component
const SimpleLoading = React.memo(() => (
  <div className="simple-loading">
    <div className="loading-dots">
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
    </div>
    <span className="loading-text">Thinking...</span>
  </div>
));

// Memoized Empty State
const EmptyState = React.memo(({ isDarkMode }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="empty-state-icon">
        <Database className="w-12 h-12" />
      </div>
      <h3 className="text-2xl font-bold mb-3 gradient-text">
        Ask me anything about your data
      </h3>
      <p className={`mb-6 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        I'll analyze your database and generate SQL queries to get you the insights you need.
      </p>
      <div className="space-y-3">
        <div className="glass-panel text-left">
          <span className="font-medium text-sm">✨ Try asking:</span>
          <div className="mt-2 space-y-2 text-sm opacity-80">
            <div>"Show me the top 10 customers by revenue"</div>
            <div>"What are our sales by month this year?"</div>
            <div>"How many orders were placed last week?"</div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

// Optimized Messages List Component
const MessagesList = React.memo(({ messages, isDarkMode, formatTime, copyToClipboard }) => (
  <div className="space-y-2 w-full">
    {messages.map((message) => {
      if (message.type === 'user') {
        return (
          <UserMessage 
            key={message.id} 
            message={message} 
            isDarkMode={isDarkMode}
            formatTime={formatTime}
          />
        );
      } else if (message.type === 'error') {
        return (
          <ErrorMessage 
            key={message.id} 
            message={message} 
            isDarkMode={isDarkMode}
            formatTime={formatTime}
          />
        );
      } else {
        return (
          <BotMessage 
            key={message.id} 
            message={message} 
            isDarkMode={isDarkMode}
            formatTime={formatTime}
            copyToClipboard={copyToClipboard}
          />
        );
      }
    })}
  </div>
));

// Memoized User Message
const UserMessage = React.memo(({ message, isDarkMode, formatTime }) => (
  <div className="flex justify-end mb-4 group animate-slide-up">
    <div className="flex items-end space-x-3 max-w-2xl">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatTime(message.timestamp)}
        </span>
      </div>
      <div className="glass-message user-message">
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
      <div className="avatar user-avatar">
        <User className="w-4 h-4" />
      </div>
    </div>
  </div>
));

// Memoized Error Message
const ErrorMessage = React.memo(({ message, isDarkMode, formatTime }) => (
  <div className="flex justify-start mb-6 group animate-slide-up">
    <div className="flex items-start space-x-3 max-w-2xl">
      <div className="avatar error-avatar">
        <AlertCircle className="w-4 h-4 text-red-400" />
      </div>
      <div className="glass-panel error-panel">
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
          <span className="text-xs text-red-300">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  </div>
));

// Optimized Bot Message with Table Sync
const BotMessage = React.memo(({ message, isDarkMode, formatTime, copyToClipboard }) => {
  const data = message.content;
  const headerScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);

  // Stable scroll sync function
  const syncHorizontalScroll = useCallback((sourceRef, targetRef) => {
    if (sourceRef.current && targetRef.current) {
      targetRef.current.scrollLeft = sourceRef.current.scrollLeft;
    }
  }, []);

  return (
    <div className="flex justify-start mb-6 group animate-slide-up">
      <div className="flex items-start space-x-3 w-full">
        <div className="avatar bot-avatar">
          <Bot className="w-4 h-4" />
        </div>
        
        <div className="flex-1 space-y-4 min-w-0">
          {/* Response Text */}
          {data.text_response && (
            <div className="glass-panel">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed">{data.text_response}</p>
              </div>
            </div>
          )}

          {/* SQL Query Display */}
          {data.sql_query?.query && (
            <div className="glass-panel">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white border-opacity-20">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Generated SQL</span>
                </div>
                <button
                  onClick={() => copyToClipboard(data.sql_query.query)}
                  className="glass-button text-xs px-2 py-1"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </button>
              </div>
              <div className="code-block">
                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {data.sql_query.query}
                </pre>
              </div>
              {data.sql_query.explanation && (
                <p className="text-xs opacity-70 mt-3 leading-relaxed">
                  {data.sql_query.explanation}
                </p>
              )}
            </div>
          )}

          {/* Results Display */}
          {data.result && data.query_type === 'table' && (
            <TableDisplay 
              result={data.result}
              headerScrollRef={headerScrollRef}
              bodyScrollRef={bodyScrollRef}
              syncHorizontalScroll={syncHorizontalScroll}
            />
          )}

          {/* Chart Display */}
          {data.chart && data.query_type === 'chart' && (
            <div className="glass-panel">
              <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-white border-opacity-20">
                <BarChart3 className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">
                  Chart: {data.chart.chart_type}
                </span>
              </div>
              <ChartRenderer chartData={data.chart} isDarkMode={isDarkMode} />
            </div>
          )}

          {/* Error Display */}
          {data.error_message && (
            <div className="glass-panel error-panel">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-300">Query Error</p>
                  <p className="text-sm text-red-200 mt-1 leading-relaxed">{data.error_message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Processing Time */}
          <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatTime(message.timestamp)}
            </span>
            {data.processing_time_ms && (
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {Math.round(data.processing_time_ms)}ms
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// Separate memoized table component
const TableDisplay = React.memo(({ result, headerScrollRef, bodyScrollRef, syncHorizontalScroll }) => (
  <div className="glass-panel">
    <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-white border-opacity-20">
      <Table className="w-4 h-4 text-purple-400" />
      <span className="text-sm font-medium">
        Results ({result.row_count} rows)
      </span>
    </div>
    
    <div className="constrained-table-container">
      {/* Fixed Header */}
      <div 
        ref={headerScrollRef}
        className="table-header-container"
        onScroll={() => syncHorizontalScroll(headerScrollRef, bodyScrollRef)}
      >
        <table className="data-table">
          <thead className="table-header">
            <tr>
              {result.columns.map((col, idx) => (
                <th key={idx} className="table-header-cell">
                  {col.replace(/_/g, ' ').toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      
      {/* Scrollable Body */}
      <div 
        ref={bodyScrollRef}
        className="table-body-scroll"
        onScroll={() => syncHorizontalScroll(bodyScrollRef, headerScrollRef)}
      >
        <table className="data-table">
          <tbody>
            {result.data.map((row, idx) => (
              <tr key={idx} className="table-row">
                {result.columns.map((col, colIdx) => (
                  <td key={colIdx} className="table-cell">
                    {row[col] !== null && row[col] !== undefined ? (
                      <span className="cell-content">
                        {String(row[col])}
                      </span>
                    ) : (
                      <span className="null-value">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="table-footer">
        <div className="table-info">
          <span className="text-xs opacity-70">
            {result.row_count} rows • {result.columns.length} columns
          </span>
          <span className="text-xs opacity-50">
            • Scroll horizontally to see all data
          </span>
        </div>
      </div>
    </div>
  </div>
));

export default ChatInterface;