import React from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import type { NotificationData } from '../types';
import Modal from './Modal';

interface NotificationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationData[];
}

const NotificationHistoryModal: React.FC<NotificationHistoryModalProps> = ({ isOpen, onClose, notifications }) => {
    const titleId = "notification-history-modal-title";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Notification History" containerClasses="max-w-2xl">
            <div className="sticky top-0 bg-primary-green text-white px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
                <h5 id={titleId} className="text-lg font-semibold flex items-center">
                    <FaBell className="mr-3" /> Notification History
                </h5>
                <button onClick={onClose} className="text-white text-2xl hover:text-gray-200" aria-label="Close modal"><FaTimes /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
                {notifications.length > 0 ? (
                    <ul className="space-y-4">
                        {notifications.map(notification => (
                            <li key={notification.id} className={`flex items-start p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border-l-4 ${notification.color}`}>
                                <div className="mr-4 mt-1">
                                    <div className={`p-2 rounded-full ${notification.color.replace('border', 'bg')}`}>
                                        <notification.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                        <FaBell className="mx-auto text-5xl mb-4 opacity-50" />
                        <p className="text-lg">No notifications yet.</p>
                        <p className="text-sm">New alerts will appear here as they happen.</p>
                    </div>
                )}
            </div>
            
            <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-900/50 px-6 py-4 flex justify-end items-center space-x-3 border-t dark:border-gray-700 rounded-b-lg">
                <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-500">Close</button>
            </div>
        </Modal>
    );
};

export default NotificationHistoryModal;
