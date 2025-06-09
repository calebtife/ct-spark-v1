import React from 'react';
import { usePWA } from '../hooks/usePWA';
import { HiDownload, HiX } from 'react-icons/hi';
import { useState } from 'react';

const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(true);

  if (!isInstallable || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Install CT SPARK App
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Get faster access and offline features by installing our app
          </p>
          <div className="flex gap-2">
            <button
              onClick={installApp}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
            >
              <HiDownload className="w-3 h-3" />
              Install
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;