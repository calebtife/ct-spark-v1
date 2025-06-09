import React, { useState } from 'react';
import { HiPlay, HiRefresh } from 'react-icons/hi';

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  timestamp: Date;
}

const SpeedTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [progress, setProgress] = useState(0);

  const runSpeedTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);

    // Simulate speed test progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate speed test (replace with actual implementation)
    setTimeout(() => {
      setResult({
        downloadSpeed: Math.random() * 100 + 20,
        uploadSpeed: Math.random() * 50 + 10,
        ping: Math.random() * 50 + 10,
        timestamp: new Date()
      });
      setIsRunning(false);
      clearInterval(progressInterval);
    }, 3000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Speed Test</h3>
        <button
          onClick={runSpeedTest}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <>
              <HiRefresh className="w-4 h-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <HiPlay className="w-4 h-4" />
              Start Test
            </>
          )}
        </button>
      </div>

      {isRunning && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Testing speed...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {result.downloadSpeed.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Mbps Download</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {result.uploadSpeed.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Mbps Upload</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {result.ping.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">ms Ping</div>
          </div>
        </div>
      )}

      {!result && !isRunning && (
        <div className="text-center text-gray-500 py-8">
          Click "Start Test" to check your internet speed
        </div>
      )}
    </div>
  );
};

export default SpeedTest;