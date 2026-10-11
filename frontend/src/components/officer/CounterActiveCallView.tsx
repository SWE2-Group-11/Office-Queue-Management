import React from 'react';
import Header from '../common/Header';

interface CounterActiveCallViewProps {
  counterNumber: number;
  ticketCode: string;
  serviceName: string;
  onComplete: () => void;
}

export default function CounterActiveCallView({
  counterNumber,
  ticketCode,
  serviceName,
  onCallComplete,
}: CounterActiveCallViewProps) {
  return (
     <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
     <Header />
    <div className="bg-white border-2 border-gray-200 rounded-xl p-8 flex flex-col justify-between shadow-sm h-full">
       
      <div className="flex flex-col h-full justify-between items-center text-center">
        <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full font-extrabold text-sm flex items-center gap-2 mb-2">
          <span>🟢</span> Now calling
        </div>
        
        <div className="text-8xl font-black tracking-tight text-gray-900 my-4">
          {ticketCode} 12
        </div>

        <div className="flex w-full border-2 border-gray-200 rounded-lg overflow-hidden my-4 text-left">
          <div className="flex-1 p-4 border-r-2 border-gray-200 bg-gray-50/50">
            <span className="text-xs font-extrabold text-gray-500 tracking-wider block mb-1">SERVICE</span>
            <span className="text-lg font-extrabold text-gray-900">{serviceName} Send a Package</span>
          </div>
         
        </div>

        <button
          onClick={onCallComplete}
          className="w-full bg-slate-900 text-white  hover:bg-slate-800 text-white font-extrabold text-xl py-5 rounded-lg transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-md"
        >
            
          <span>✅</span> COMPLETE 
        </button>
      </div>
    </div>
    </div>
  );
}