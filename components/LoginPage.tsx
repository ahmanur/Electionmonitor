import React, { useState } from 'react';
import { FaUser, FaLock, FaUserShield, FaUserTie } from 'react-icons/fa';
import { sanitizeInput, validatePassword, validateUsername } from '../utils/validation';
import ValidatedInput from './ValidatedInput';

interface LoginPageProps {
  onAdminLogin: (username: string, password: string) => boolean;
  onAgentLogin: (username: string, password: string) => boolean;
}

type LoginType = 'admin' | 'agent';

const LoginPage: React.FC<LoginPageProps> = ({ onAdminLogin, onAgentLogin }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState({ username: false, password: false });
  const [errors, setErrors] = useState<{ username: string | null; password: string | null }>({ username: null, password: null });
  const [serverError, setServerError] = useState('');
  const [loginType, setLoginType] = useState<LoginType>('admin');

  const validate = (field: keyof typeof formData, value: string) => {
      if (field === 'username') {
          return validateUsername(value);
      }
      if (field === 'password') {
          return validatePassword(value);
      }
      return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof typeof formData; value: string };
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof typeof formData; value: string };
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    // Validate all fields on submit
    const newErrors = {
        username: validate('username', formData.username),
        password: validate('password', formData.password),
    };
    setErrors(newErrors);
    setTouched({ username: true, password: true });
    
    if (Object.values(newErrors).some(err => err !== null)) {
        return;
    }

    const sanitizedUsername = sanitizeInput(formData.username);
    let success = false;
    if (loginType === 'admin') {
        success = onAdminLogin(sanitizedUsername, formData.password);
        if (!success) setServerError('Invalid admin username or password.');
    } else {
        success = onAgentLogin(sanitizedUsername, formData.password);
        if (!success) setServerError('Invalid agent username or password.');
    }
  };

  const handleTabClick = (type: LoginType) => {
      setLoginType(type);
      setFormData({ username: '', password: '' });
      setErrors({ username: null, password: null });
      setTouched({ username: false, password: false });
      setServerError('');
  }

  const tabButtonClasses = (type: LoginType) => 
    `flex-1 py-3 text-sm font-medium flex items-center justify-center transition-colors duration-200 focus:outline-none ${
      loginType === type 
        ? 'text-primary-green dark:text-accent-gold border-b-2 border-primary-green dark:border-accent-gold' 
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
    }`;
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex border-b dark:border-gray-700" role="tablist" aria-label="Login type">
            <button
                id="admin-tab"
                role="tab"
                aria-selected={loginType === 'admin'}
                aria-controls="login-panel"
                onClick={() => handleTabClick('admin')}
                className={tabButtonClasses('admin')}
            >
                <FaUserTie className="mr-2" /> Admin Login
            </button>
            <button
                id="agent-tab"
                role="tab"
                aria-selected={loginType === 'agent'}
                aria-controls="login-panel"
                onClick={() => handleTabClick('agent')}
                className={tabButtonClasses('agent')}
            >
                <FaUserShield className="mr-2" /> Agent Login
            </button>
        </div>
        
        <div id="login-panel" role="tabpanel" tabIndex={0} aria-labelledby={loginType === 'admin' ? 'admin-tab' : 'agent-tab'} className="p-8 focus:outline-none">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
                <svg width="60" height="60" xmlns="http://www.w.org/2000/svg" aria-hidden="true">
                  <circle cx="30" cy="30" r="30" fill="#008753"/>
                  <text x="30" y="32" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="white">ELECTION</text>
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {loginType === 'admin' ? 'Admin Portal' : 'Agent Portal'}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {loginType === 'admin' ? 'Election Monitoring Dashboard' : 'Please log in to submit reports.'}
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleLoginSubmit} noValidate>
            <ValidatedInput
                id="username"
                label="Username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.username}
                touched={touched.username}
                placeholder="Enter your username"
                Icon={FaUser}
            />
            <ValidatedInput
                id="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
                placeholder="Enter your password"
                Icon={FaLock}
            />
            
            {serverError && (
              <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-md" role="alert">
                {serverError}
              </div>
            )}

            {loginType === 'admin' && (
                <div className="text-sm text-right">
                    <button
                        type="button"
                        className="font-medium text-primary-green hover:text-green-700 dark:hover:text-green-400"
                    >
                        Forgot your password?
                    </button>
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;