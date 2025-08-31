import React from 'react';
import { FaTachometerAlt, FaClipboardList, FaExclamationCircle, FaChartBar, FaCog, FaUsersCog, FaFileAlt, FaComments } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { AdminUser } from '../types';

interface NavItemProps {
  icon: IconType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => {
  return (
    <li className="mb-1">
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`flex items-center py-3 px-4 rounded-md transition-all duration-200 border-l-4 ${
          active 
            ? 'bg-green-50 dark:bg-primary-green/20 border-primary-green text-primary-green dark:text-accent-gold font-semibold' 
            : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-primary-green'
        }`}
        aria-current={active ? 'page' : undefined}
      >
        <Icon className="w-5 h-5 mr-3 text-primary-green" />
        <span className="text-sm">{label}</span>
      </a>
    </li>
  );
};

interface SidebarProps {
  onNavigate: {
    dashboard: () => void;
    manageAgents: () => void;
    results: () => void;
    analytics: () => void;
    report: () => void;
    incidenceReports: () => void;
    notifications: () => void;
    settings: () => void;
  };
  currentUser: AdminUser | null;
  activeView: string;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentUser, activeView, isOpen, onClose }) => {
  const handleNavigation = (action: () => void) => {
    action();
    onClose();
  };

  const navItems = [
    { view: 'dashboard', icon: FaTachometerAlt, label: 'Dashboard', action: onNavigate.dashboard },
    { view: 'manageAgents', icon: FaUsersCog, label: 'Manage Agents', action: onNavigate.manageAgents },
    { view: 'results', icon: FaClipboardList, label: 'Results', action: onNavigate.results },
    { view: 'analytics', icon: FaChartBar, label: 'Analytics', action: onNavigate.analytics },
    { view: 'report', icon: FaFileAlt, label: 'Report', action: onNavigate.report },
    { view: 'incidenceReports', icon: FaExclamationCircle, label: 'Incidence Reports', action: onNavigate.incidenceReports },
    { view: 'notifications', icon: FaComments, label: 'Communications', action: onNavigate.notifications },
  ];
  
  const settingsItem = { view: 'settings', icon: FaCog, label: 'Settings', action: onNavigate.settings };

  return (
    <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-gray-800 shadow-lg p-4 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-64 md:min-h-[calc(100vh-64px)] ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}`}>
      <nav>
        <ul>
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={activeView === item.view}
              onClick={() => handleNavigation(item.action)}
            />
          ))}
          {currentUser?.accessLevel === 'full' && (
            <NavItem
              key={settingsItem.label}
              icon={settingsItem.icon}
              label={settingsItem.label}
              active={activeView === settingsItem.view}
              onClick={() => handleNavigation(settingsItem.action)}
            />
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;