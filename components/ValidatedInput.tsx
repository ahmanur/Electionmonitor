import React from 'react';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface ValidatedInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error: string | null;
  touched: boolean;
  placeholder?: string;
  Icon?: React.ElementType;
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  Icon,
}) => {
  const isValid = touched && !error;
  const isInvalid = touched && !!error;
  const errorId = `${id}-error`;

  const inputClasses = `
    block w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white
    ${Icon ? 'pl-10' : ''}
    ${isInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
    ${isValid ? 'border-green-500 focus:ring-green-500 focus:border-green-500' : ''}
  `;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          name={id}
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClasses}
          placeholder={placeholder}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? errorId : undefined}
        />
        {isValid && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaCheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
            </div>
        )}
        {isInvalid && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaExclamationCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
        )}
      </div>
      {isInvalid && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
};

export default ValidatedInput;