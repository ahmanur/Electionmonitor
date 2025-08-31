import React from 'react';
import Modal from './Modal';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} containerClasses="max-w-md">
      <div className="p-6">
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
            <FaExclamationTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Confirm
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
