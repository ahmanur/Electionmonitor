import React from 'react';

interface ToggleSwitchProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, enabled, onChange }) => {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{label}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        className={`${
          enabled ? 'bg-primary-green' : 'bg-gray-200 dark:bg-gray-600'
        } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green`}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
