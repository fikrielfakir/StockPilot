import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useLocalStorageBackup() {
  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      articles: localStorage.getItem('articles') || '[]',
      suppliers: localStorage.getItem('suppliers') || '[]',
      requestors: localStorage.getItem('requestors') || '[]',
      purchaseRequests: localStorage.getItem('purchaseRequests') || '[]',
      receptions: localStorage.getItem('receptions') || '[]',
      outbounds: localStorage.getItem('outbounds') || '[]',
      stockMovements: localStorage.getItem('stockMovements') || '[]',
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stock-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          // Restore data to localStorage
          Object.entries(data).forEach(([key, value]) => {
            if (key !== 'timestamp' && typeof value === 'string') {
              localStorage.setItem(key, value);
            }
          });
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  return { exportData, importData };
}
