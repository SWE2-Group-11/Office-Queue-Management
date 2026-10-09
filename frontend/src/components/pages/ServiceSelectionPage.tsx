import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import ServiceCard from '../queue/ServiceCard';
import ServiceConfirmationModal from '../queue/ServiceConfirmationModal';
import TicketSuccessView from '../queue/TicketSuccessView';

interface Service {
  id: number | string;
  category: string;
  name: string;
  description: string;
  estWait: string;
  theme?: string;
}

interface TicketData {
  ticketCode: string;
  serviceName: string;
}

export default function ServiceSelectionPage() {
  const mockServices: Service[] = [
    { id: 1, category: 'ACCOUNT',  name: 'Account Services', description: 'Deposits, withdrawals and account assistance',  estWait: '~8 min',  theme: 'blue' },
    { id: 2, category: 'POSTAL', name: 'Send a Package', description: 'Domestic and international shipping',  estWait: '~55 min',   theme: 'teal' },
    { id: 3, category: 'COLLECTION', name: 'Collect a Package', description: 'Pick up a package or registered item', estWait: '~15 min',   theme: 'emerald' },
    { id: 4, category: 'POSTAL',  name: 'Postal Services', description: 'Stamps, registered mail and other services',  estWait: '~30 min',  theme: 'blue' }
  ];

  const [services, setServices] = useState<Service[]>(mockServices);
  const [activeModalService, setActiveModalService] = useState<Service | null>(null);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

 
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) throw new Error('Failed to fetch services');
        const data = await response.json();
        if (data && data.length > 0) {
          setServices(data);
        }
      } catch (err) {
       
        console.log('Using fallback mock services.');
      }
    };

    fetchServices();
  }, []);

  const handleGetTicket = async (serviceId: number | string) => {
    if (!activeModalService) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });
      if (!response.ok) throw new Error('Could not generate ticket');
      const ticket = await response.json();
      
      setTicketData({
        ticketCode: ticket.ticketCode || 'A003',
        serviceName: activeModalService.name,
      });
      setActiveModalService(null);
    } catch (err) {
      setTicketData({
        ticketCode: 'A003',
        serviceName: activeModalService.name,
      });
      setActiveModalService(null);
    } finally {
      setLoading(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-8 py-12 block">
        {ticketData ? (
          <TicketSuccessView ticketData={ticketData} onReset={() => setTicketData(null)} />
        ) : (
          <>
            <div className="flex justify-between items-end mb-10">
              <div className="text-left">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Today · {todayFormatted}
                </p>

                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  What do you need help with?
                </h1>

                <p className="text-slate-600 mt-2 text-base">
                  Choose a service below and get a ticket.
                </p>
              </div>

              <div className="flex items-center space-x-8 text-right">
                <div>
                  <span className="text-2xl font-bold text-slate-900 block">
                    {services.length}
                  </span>
                  <span className="text-xs text-slate-500">
                    services available
                  </span>
                </div>
              </div>
            </div>

            {error && <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg text-sm text-red-700">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onSelect={(s: any) => setActiveModalService(s)} 
                />
              ))}
            </div>
          </>
        )}
      </main>

      <ServiceConfirmationModal 
        service={activeModalService} 
        onClose={() => setActiveModalService(null)} 
        onConfirm={handleGetTicket} 
        loading={loading} 
      />
    </div>
  );
}