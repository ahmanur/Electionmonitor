import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  containerClasses?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, containerClasses = 'max-w-lg' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${React.useId()}`;

  // Close modal on 'Escape' key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Trap focus within the modal
  useFocusTrap(modalRef, isOpen);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full ${containerClasses} max-h-[90vh] flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  return modalRoot ? createPortal(modalContent, modalRoot) : null;
};

export default Modal;