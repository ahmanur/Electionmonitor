import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';

// Define the shape of our settings
export interface AppSettings {
  showNotifications: boolean;
  showOverVotingAlert: boolean;
}

// Define the shape of the context value
interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

// Default settings
const defaultSettings: AppSettings = {
  showNotifications: false,
  showOverVotingAlert: true,
};

// Function to get initial settings from localStorage
const getInitialSettings = (): AppSettings => {
  if (typeof window !== 'undefined') {
    try {
      const storedSettings = window.localStorage.getItem('appSettings');
      if (storedSettings) {
        // Merge stored settings with defaults to ensure all keys are present
        return { ...defaultSettings, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
  }
  return defaultSettings;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(getInitialSettings);

  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  };
  
  const value = useMemo(() => ({ settings, updateSettings }), [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};