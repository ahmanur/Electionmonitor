import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: FaCheckCircle,
    color: 'border-green-500',
    iconColor: 'text-green-500',
  },
  error: {
    icon: FaTimesCircle,
    color: 'border-red-500',
    iconColor: 'text-red-500',
  },
  info: {
    icon: FaInfoCircle,
    color: 'border-blue-500',
    iconColor: 'text-blue-500',
  },
  warning: {
    icon: FaExclamationTriangle,
    color: 'border-yellow-500',
    iconColor: 'text-yellow-500',
  },
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [exiting, setExiting] = useState(false);
  const { icon: Icon, color, iconColor } = toastConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 500); // Wait for animation
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 500);
  };

  const animationClasses = exiting ? 'animate-fade-out-right' : 'animate-fade-in-right';

  return (
    <div
      className={`relative flex items-center w-full p-4 overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 ${color} ${animationClasses}`}
      role="alert"
    >
      <div className={`mr-3 text-2xl ${iconColor}`}>
        <Icon />
      </div>
      <div className="flex-1 mr-2">
        <p className={`text-sm font-semibold ${iconColor}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
      </div>
      <button onClick={handleClose} className="text-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none" aria-label="Close notification">
        &times;
      </button>
    </div>
  );
};

export default Toast;
