import React, { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { sanitizeInput, validatePassword } from '../utils/validation';

interface AgentLoginPageProps {
  onLogin: (username: string, password: string) => boolean;
  onSwitchToAdmin: () => void;
}

const AgentLoginPage: React.FC<AgentLoginPageProps> = ({ onLogin, onSwitchToAdmin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sanitizedUsername = sanitizeInput(username);
    const usernameError = !sanitizedUsername ? 'Username is required.' : null;
    const passwordError = validatePassword(password);
    
    if (usernameError || passwordError) {
      setError(usernameError || passwordError || 'An unknown error occurred.');
      return;
    }

    const success = onLogin(sanitizedUsername, password);
    if (!success) {
      setError('Invalid agent username or password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
            <div className="flex items-center justify-center mb-4">
                <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="30" fill="#008753"/>
                  <text x="30" y="32" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="white">ELECTION</text>
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Agent Portal
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please log in to submit reports.
            </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaUser className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                placeholder="Agent Username"
              />
            </div>
            <div className="relative">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                placeholder="Password"
              />
            </div>
            
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-md" role="alert">
                {error}
              </div>
            )}
    
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green transition-colors duration-200"
              >
                Log in
              </button>
            </div>
        </form>
         <div className="mt-4 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Are you an admin?{' '}
            <button
              onClick={onSwitchToAdmin}
              className="font-medium text-primary-green hover:text-green-700 dark:hover:text-green-400"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentLoginPage;
