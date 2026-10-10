import React from 'react';

interface TicketData {
  ticketCode: string;
  serviceName: string;
  estimatedWait: string;
}

interface TicketSuccessViewProps {
  ticketData: TicketData;
  onReset: () => void;
}

export default function TicketSuccessView({
  ticketData,
  onReset,
}: TicketSuccessViewProps) {
  return (
    <div className="bg-white max-w-lg mx-auto p-8 rounded-2xl border-2 border-slate-300 shadow-sm text-left space-y-6">
      
     
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-xl font-bold border border-emerald-300 shrink-0">
          ✓
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Ticket Issued Successfully!
          </h2>
          <p className="text-slate-600 text-sm">Please keep your code ready when called.</p>
        </div>
      </div>

      
      <div className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Your Ticket Code
        </span>

        <span className="text-6xl font-black text-slate-900 mt-2 block tracking-wider font-mono">
          {ticketData.ticketCode}
        </span>

        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Selected Service</span>
          <span className="text-lg font-bold text-slate-900">{ticketData.serviceName}</span>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <span className="text-xs font-bold text-slate-900 uppercase block mb-1">
            Estimated Waiting Time
          </span>
          <span className="text-2xl font-extrabold text-slate-900">
            {ticketData.estimatedWait}
          </span>
        </div>
      </div>

    
      <div className="flex items-start space-x-3 text-xs text-slate-700 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
        <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="leading-relaxed font-medium">This is an estimate and may change as customers are served.</span>
      </div>

 
      <button
        onClick={onReset}
        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base shadow-sm transition-all"
      >
        Done
      </button>
    </div>
  );
}