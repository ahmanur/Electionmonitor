import React, { useEffect, useState } from 'react';
import type { NotificationData } from '../types';

interface NotificationProps {
  notification: NotificationData;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 500); // Wait for animation
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 500);
  };

  const animationClasses = exiting ? 'animate-fade-out-right' : 'animate-fade-in-right';
  
  return (
    <div 
      className={`relative flex items-start w-full p-4 mb-4 overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 ${notification.color} ${animationClasses}`}
      role="alert"
    >
      <div className="mr-3">
        <div className={`p-2 rounded-full ${notification.color.replace('border', 'bg')}`}>
            <notification.icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex-1 mr-2">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">New Activity</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
      </div>
      <button onClick={handleClose} className="text-xl text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Close notification">
        &times;
      </button>
    </div>
  );
};

export default Notification;