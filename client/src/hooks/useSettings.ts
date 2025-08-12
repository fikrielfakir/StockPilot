import { useState, useEffect, createContext, useContext } from 'react';

interface AppSettings {
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  language: string;
  density: 'compact' | 'comfortable' | 'spacious';
  accentColor: string;
  fontSize: number;
  animations: boolean;
  
  // Functionality
  autoSave: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  notifications: boolean;
  soundEffects: boolean;
  confirmActions: boolean;
  
  // Data & Performance
  cacheSize: number;
  offlineMode: boolean;
  dataValidation: boolean;
  performanceMode: 'standard' | 'optimized' | 'maximum';
  
  // Security
  sessionTimeout: number;
  autoLogout: boolean;
  auditLogging: boolean;
  twoFactorAuth: boolean;
  
  // Advanced
  developerMode: boolean;
  debugMode: boolean;
  apiTimeout: number;
  maxRetries: number;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => void;
}

const defaultSettings: AppSettings = {
  // Appearance defaults
  theme: 'light',
  language: 'fr',
  density: 'comfortable',
  accentColor: '#3B82F6',
  fontSize: 14,
  animations: true,
  
  // Functionality defaults
  autoSave: true,
  autoRefresh: true,
  refreshInterval: 30,
  notifications: true,
  soundEffects: false,
  confirmActions: true,
  
  // Data & Performance defaults
  cacheSize: 100,
  offlineMode: true,
  dataValidation: true,
  performanceMode: 'standard',
  
  // Security defaults
  sessionTimeout: 60,
  autoLogout: true,
  auditLogging: true,
  twoFactorAuth: false,
  
  // Advanced defaults
  developerMode: false,
  debugMode: false,
  apiTimeout: 10000,
  maxRetries: 3
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const useSettingsHook = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('stockceramique-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('stockceramique-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('stockceramique-settings');
  };

  const exportSettings = (): string => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsJson: string) => {
    try {
      const imported = JSON.parse(settingsJson);
      setSettings(prev => ({ ...prev, ...imported }));
    } catch (error) {
      throw new Error('Invalid settings format');
    }
  };

  return {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings
  };
};

// Context Provider component (you would wrap your app with this)
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const settingsHook = useSettingsHook();
  
  return (
    <SettingsContext.Provider value={settingsHook}>
      {children}
    </SettingsContext.Provider>
  );
};