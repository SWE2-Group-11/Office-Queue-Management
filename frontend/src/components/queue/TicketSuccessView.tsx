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
    <div className="bg-white max-w-lg mx-auto p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-6">
      
      
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
        ✓
      </div>

     
      <h2 className="text-2xl font-bold text-slate-900">
        Ticket Issued Successfully!
      </h2>

     
      <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300">
        
        <span className="text-xs text-slate-400 uppercase tracking-wider block">
          Your Ticket
        </span>

        <span className="text-5xl font-black text-sky-600 mt-2 block tracking-tight">
          {ticketData.ticketCode}
        </span>

        <span className="text-sm font-medium text-slate-600 mt-2 block">
          {ticketData.serviceName}
        </span>

      
        <div className="mt-6 pt-5 border-t border-slate-200">
          <span className="text-[10px] font-extrabold tracking-wider text-slate-900 uppercase block mb-1">
            Estimated Waiting Time
          </span>

          <span className="text-2xl font-extrabold text-slate-900">
            {ticketData.estimatedWait}
          </span>
        </div>
      </div>
       <div className="flex items-center space-x-2 text-xs text-slate-500 mb-8 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
          <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>This is an estimate and may change as customers are served.</span>
        </div>

   
      <button
        onClick={onReset}
        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-sm transition-all"
      >
        Done
      </button>
    </div>
  );
}

