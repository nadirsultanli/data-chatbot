import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Database, Loader2, AlertCircle, ArrowRight, Shield, Moon, Sun } from 'lucide-react';

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    metabaseUrl: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          metabase_url: formData.metabaseUrl || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('sessionToken', data.session_token);
        localStorage.setItem('userInfo', JSON.stringify(data.user_info));
        
        if (onLoginSuccess) {
          onLoginSuccess(data);
        }
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Unable to connect to server. Please check if the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`login-app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Fixed Styles */}
      <style>{`
        .login-app {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .light-mode {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%);
          color: #1f2937;
        }

        .dark-mode {
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #0f0f0f 100%);
          color: #ffffff;
        }

        .login-app::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${isDarkMode 
            ? 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(120, 119, 255, 0.3) 0%, transparent 50%)' 
            : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)'};
          pointer-events: none;
        }

        .theme-toggle {
          position: absolute;
          top: 40px;
          right: 40px;
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)'};
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(0, 0, 0, 0.1)'};
          backdrop-filter: blur(10px);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: ${isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)'};
        }

        .theme-toggle:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: ${isDarkMode 
            ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
            : '0 12px 40px rgba(0, 0, 0, 0.15)'};
        }

        .login-container {
          width: 100%;
          max-width: 500px;
          position: relative;
          z-index: 1;
        }

        .login-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .logo-container {
          width: 100px;
          height: 100px;
          margin: 0 auto 30px;
          background: ${isDarkMode 
            ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))' 
            : 'linear-gradient(145deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7))'};
          backdrop-filter: blur(10px);
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(255, 255, 255, 0.1)'};
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: ${isDarkMode 
            ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
            : '0 20px 40px rgba(0, 0, 0, 0.15)'};
          color: ${isDarkMode ? '#ffffff' : '#ffffff'};
          transition: all 0.3s ease;
        }

        .logo-container:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: ${isDarkMode 
            ? '0 25px 50px rgba(0, 0, 0, 0.4)' 
            : '0 25px 50px rgba(0, 0, 0, 0.2)'};
        }

        .main-title {
          font-size: 42px;
          font-weight: 700;
          margin-bottom: 16px;
          background: ${isDarkMode 
            ? 'linear-gradient(to right, #ffffff, #d1d5db)' 
            : 'linear-gradient(to right, #1f2937, #6b7280)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
        }

        .subtitle {
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
          line-height: 1.6;
          font-size: 18px;
          max-width: 400px;
          margin: 0 auto;
        }

        .login-card {
          background: ${isDarkMode 
            ? 'linear-gradient(145deg, rgba(42, 42, 42, 0.6), rgba(26, 26, 26, 0.6))' 
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))'};
          backdrop-filter: blur(20px);
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 30px;
          overflow: hidden;
          box-shadow: ${isDarkMode 
            ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
            : '0 20px 40px rgba(0, 0, 0, 0.1)'};
          transition: all 0.3s ease;
          width: 100%;
        }

        .login-card:hover {
          transform: translateY(-4px);
          box-shadow: ${isDarkMode 
            ? '0 25px 50px rgba(0, 0, 0, 0.4)' 
            : '0 25px 50px rgba(0, 0, 0, 0.15)'};
        }

        .error-banner {
          background: ${isDarkMode 
            ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))' 
            : 'linear-gradient(145deg, rgba(254, 242, 242, 0.9), rgba(254, 226, 226, 0.9))'};
          border-bottom: 1px solid ${isDarkMode 
            ? 'rgba(239, 68, 68, 0.3)' 
            : 'rgba(239, 68, 68, 0.2)'};
          padding: 20px 24px;
        }

        .error-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .error-text {
          color: ${isDarkMode ? '#fca5a5' : '#dc2626'};
          font-size: 14px;
          line-height: 1.5;
        }

        .form-container {
          padding: 40px;
        }

        .form-group {
          margin-bottom: 28px;
        }

        .form-label {
          display: block;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: ${isDarkMode ? '#ffffff' : '#1f2937'};
        }

        .optional-label {
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
          font-weight: 400;
          font-size: 14px;
          margin-left: 4px;
        }

        .input-container {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 18px 24px;
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(255, 255, 255, 0.8)'};
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'};
          border-radius: 18px;
          font-size: 16px;
          color: ${isDarkMode ? '#ffffff' : '#1f2937'};
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          outline: none;
        }

        .form-input:focus {
          border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(255, 255, 255, 0.95)'};
          transform: translateY(-1px);
          box-shadow: ${isDarkMode 
            ? '0 8px 25px rgba(0, 0, 0, 0.2)' 
            : '0 8px 25px rgba(0, 0, 0, 0.1)'};
        }

        .form-input::placeholder {
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'};
        }

        .password-container {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .password-toggle:hover {
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};
          background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
        }

        .help-text {
          font-size: 14px;
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
          margin-top: 8px;
        }

        .submit-button {
          width: 100%;
          background: ${isDarkMode 
            ? 'linear-gradient(145deg, #ffffff, #e5e7eb)' 
            : 'linear-gradient(145deg, #000000, #1f2937)'};
          color: ${isDarkMode ? '#000000' : '#ffffff'};
          border: none;
          padding: 18px 24px;
          border-radius: 18px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: ${isDarkMode 
            ? '0 8px 25px rgba(0, 0, 0, 0.2)' 
            : '0 8px 25px rgba(0, 0, 0, 0.15)'};
          margin-bottom: 20px;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: ${isDarkMode 
            ? '0 12px 35px rgba(0, 0, 0, 0.3)' 
            : '0 12px 35px rgba(0, 0, 0, 0.2)'};
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .security-footer {
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(248, 250, 252, 0.8)'};
          border-top: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)'};
          padding: 20px 40px;
          text-align: center;
        }

        .security-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .security-text {
          font-size: 14px;
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
        }

        .features-grid {
          margin-top: 50px;
          text-align: center;
          width: 100%;
        }

        .features-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          max-width: 400px;
          margin: 0 auto;
        }

        .feature-item {
          text-align: center;
        }

        .feature-icon {
          width: 50px;
          height: 50px;
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)'};
          border: 1px solid ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'};
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .feature-icon:hover {
          transform: translateY(-2px);
          background: ${isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'};
        }

        .feature-text {
          font-size: 14px;
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
          font-weight: 500;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Theme Toggle */}
      <button onClick={toggleDarkMode} className="theme-toggle">
        {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      <div className="login-container animate-fade-in">
        {/* Header */}
        <div className="login-header">
          <div className="logo-container">
            <Database className="w-12 h-12" />
          </div>
          <h1 className="main-title">SQL Assistant</h1>
          <p className="subtitle">
            Connect to your Metabase instance and start chatting with your data using natural language
          </p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          {/* Error Message */}
          {error && (
            <div className="error-banner">
              <div className="error-content">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="error-text">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="form-container">
            {/* Username Field */}
            <div className="form-group">
              <label className="form-label">
                Username or Email
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your Metabase username"
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                Password
              </label>
              <div className="password-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Metabase URL Field */}
            <div className="form-group">
              <label className="form-label">
                Metabase URL
                <span className="optional-label">(optional)</span>
              </label>
              <input
                type="url"
                name="metabaseUrl"
                value={formData.metabaseUrl}
                onChange={handleChange}
                className="form-input"
                placeholder="https://your-metabase.com"
              />
              <p className="help-text">
                Leave empty to use the default instance
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Security Footer */}
          <div className="security-footer">
            <div className="security-content">
              <Shield className="w-5 h-5" />
              <p className="security-text">
                Secure authentication via Metabase
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="features-grid">
          <div className="features-container">
            <div className="feature-item">
              <div className="feature-icon">
                <Database className="w-5 h-5" />
              </div>
              <p className="feature-text">Natural Language</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Shield className="w-5 h-5" />
              </div>
              <p className="feature-text">Secure Queries</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <ArrowRight className="w-5 h-5" />
              </div>
              <p className="feature-text">Instant Results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;