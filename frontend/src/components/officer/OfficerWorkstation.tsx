import React, { useState, useEffect } from 'react';
import CounterReadyView from './CounterReadyView';
import CounterActiveCallView from './CounterActiveCallView';
import { callNextTicket, getCounterQueue } from '../../api/officer';
import type { CounterServiceSummary } from '../../api/officer';
import { ApiError } from '../../api/client';
import Header from '../common/Header';

export default function OfficerWorkstation() {
  const [currentCounter, setCurrentCounter] = useState<number>(2);
  const [activeTicket, setActiveTicket] = useState<{ code: string; service: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [totalWaiting, setTotalWaiting] = useState<number>(11);
  const [services, setServices] = useState<CounterServiceSummary[]>([
    { name: "Send a Package", next: "S021", avgWait: "8 min", count: 6, icon: "📦" },
    { name: "Collect a Package", next: "C011", avgWait: "4 min", count: 2, icon: "📦" },
    { name: "Postal Services", next: "P031", avgWait: "3 min", count: 3, icon: "✉️" }
  ]);

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const data = await getCounterQueue(currentCounter);
        setTotalWaiting(data.totalWaiting);
        setServices(data.services);
      } catch {
        // Fallback or handle silent error for demo
      }
    };
    loadQueue();
  }, [currentCounter]);

  const handleCallNext = async () => {
    setLoading(true);
    setError(null);
    try {
      const ticket = await callNextTicket(currentCounter);
      setActiveTicket({ 
        code: ticket.code, 
        service: ticket.service_name 
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setActiveTicket({ code: 'S021', service: 'Send a Package' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans text-gray-900">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 font-bold text-sm">
          ⚠️ {error}
        </div>
      )}
    <Header />
  
      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="mt-2 text-xs font-extrabold text-gray-500 tracking-wider block mb-1">OFFICER WORKSTATION</span> 
        </div>
      
      </div>

     
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
       
     {/* Left Card: Action / Calling State */}
<div className="lg:col-span-7">
  {!activeTicket ? (
    <CounterReadyView counterNumber={currentCounter} onCallNext={handleCallNext} />
  ) : (
    <CounterActiveCallView
      counterNumber={currentCounter}
      ticketCode={activeTicket.code}
      serviceName={activeTicket.service}
      onComplete={() => setActiveTicket(null)}
    />
  )}
</div>
      
        <div className="lg:col-span-5 bg-white border-2 border-gray-200 rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-extrabold text-gray-900">Services at this counter</h3>
              <span className="font-extrabold text-sm text-gray-500"> - {totalWaiting}  waiting</span>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {services.map((svc, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 border-2 border-gray-200 rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl bg-gray-100 p-2 rounded-md">{svc.icon}</span>
                    <div>
                      <span className="font-extrabold text-sm block text-gray-900">{svc.name}</span>
                      <span className="text-xs font-semibold text-gray-500">Next: {svc.next} · avg {svc.avgWait}</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-gray-900"></span>
                </div>
              ))}
            </div>
          </div>

       
        </div>
      </div>
    </div>
  );
}