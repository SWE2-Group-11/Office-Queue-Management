import React, { useState, useEffect } from 'react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Set initial time immediately on mount
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };

    updateTime();

    // Update every second
    const timer = setInterval(updateTime, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, []);
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-800 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <span className="font-bold tracking-wider text-xs block text-slate-900">OFFICE</span>
          <span className="text-xs text-slate-500">Queue Management</span>
        </div>
      </div>

      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-emerald-700 text-xs">OPEN</span>
          <span className="text-slate-400 text-xs">08:00–18:00</span>
        </div>
        
      <span className="font-semibold text-slate-800">{currentTime}</span>
      </div>
    </header>
  );
}