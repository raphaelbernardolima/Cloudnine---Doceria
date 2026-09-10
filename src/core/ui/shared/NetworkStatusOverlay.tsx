import React, { useState, useEffect } from 'react';
import { WifiNone, WifiHigh } from '@phosphor-icons/react';

export const NetworkStatusOverlay: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] pointer-events-none flex justify-center mt-2 px-4">
      {!isOnline ? (
        <div className="bg-rose-500 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-in slide-in-from-top-4 fade-in duration-300">
          <WifiNone className="w-4 h-4" />
          <span>Você está offline. Verifique sua conexão com a internet.</span>
        </div>
      ) : showRestored ? (
        <div className="bg-emerald-500 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-in slide-in-from-top-4 fade-in duration-300">
          <WifiHigh className="w-4 h-4" />
          <span>Conexão restaurada!</span>
        </div>
      ) : null}
    </div>
  );
};
