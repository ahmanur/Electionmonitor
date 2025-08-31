import React from 'react';
import { FaSignOutAlt, FaSun, FaMoon, FaBars } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import type { AdminUser } from '../types';

interface HeaderProps {
  onLogout: () => void;
  currentUser: AdminUser | null;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, currentUser, onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-primary-green text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button onClick={onToggleSidebar} className="p-2 mr-2 rounded-md text-white hover:bg-white/20 md:hidden" aria-label="Open sidebar">
                <FaBars className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0">
              <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="20" cy="20" r="20" fill="#008753"/>
                <text x="20" y="22" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold" fill="white">ELECTION</text>
              </svg>
            </div>
            <h1 className="ml-3 text-lg sm:text-xl font-bold tracking-tight">
              <span className="hidden sm:inline">Election Monitoring </span>Dashboard
            </h1>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="mr-4 p-2 rounded-full text-white hover:bg-white/20 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
            <span className="text-sm mr-4 hidden md:block">Welcome, {currentUser?.name || 'Admin'}</span>
            <button 
              onClick={onLogout}
              className="flex items-center text-sm px-3 py-2 border border-white rounded-md hover:bg-white hover:text-primary-green transition-colors duration-200"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;