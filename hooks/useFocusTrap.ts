import { useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const useFocusTrap = (modalRef: React.RefObject<HTMLElement>, isOpen: boolean) => {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll(FOCUSABLE_ELEMENTS)
      ) as HTMLElement[];
      
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      firstElement.focus();

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      };

      modalRef.current.addEventListener('keydown', handleKeyDown);

      return () => {
        modalRef.current?.removeEventListener('keydown', handleKeyDown);
        previouslyFocusedElement.current?.focus();
      };
    }
  }, [isOpen, modalRef]);
};