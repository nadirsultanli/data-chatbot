import React, { useState, useEffect } from 'react';
import LoginForm from './components/auth/LoginForm';
import ChatInterface from './components/chat/ChatInterface';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      const sessionToken = localStorage.getItem('sessionToken');
      const userInfo = localStorage.getItem('userInfo');
      
      if (sessionToken && userInfo) {
        try {
          // Validate session with backend
          const response = await fetch('http://localhost:8000/api/auth/validate', {
            headers: {
              'Authorization': `Bearer ${sessionToken}`
            }
          });
          
          if (response.ok) {
            const sessionData = await response.json();
            if (sessionData.valid) {
              // Session is valid, restore user state
              setUser({
                session_token: sessionToken,
                user_info: JSON.parse(userInfo)
              });
            } else {
              // Session expired, clear storage
              localStorage.removeItem('sessionToken');
              localStorage.removeItem('userInfo');
            }
          } else {
            // Session invalid, clear storage
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('userInfo');
          }
        } catch (error) {
          console.error('Session validation error:', error);
          // Clear invalid session data
          localStorage.removeItem('sessionToken');
          localStorage.removeItem('userInfo');
        }
      }
      
      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    console.log('Login successful:', userData);
  };

  const handleLogout = async () => {
    const sessionToken = localStorage.getItem('sessionToken');
    
    // Try to logout from backend
    if (sessionToken) {
      try {
        await fetch('http://localhost:8000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear local storage and state
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-app-gray flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show chat interface if user is logged in
  if (user) {
    return (
      <ChatInterface 
        user={user} 
        onLogout={handleLogout}
      />
    );
  }

  // Show login form if not logged in
  return (
    <LoginForm onLoginSuccess={handleLoginSuccess} />
  );
}

export default App;