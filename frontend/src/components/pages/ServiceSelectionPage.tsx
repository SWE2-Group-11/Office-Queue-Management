import { useState, useEffect } from 'react';
import Header from '../common/Header';
import ServiceCard from '../queue/ServiceCard';
import ServiceConfirmationModal from '../queue/ServiceConfirmationModal';
import TicketSuccessView from '../queue/TicketSuccessView';
import { loginDevice, getServices, createTicket, ApiError } from '../../api/client';
interface Service {
  id: number | string;
  category: string;
  name: string;
  description: string;
  estWait: string;
}

interface TicketData {
  ticketCode: string;
  serviceName: string;
  estimatedWait: string;
}


const SERVICE_INFO: Record<string, Omit<Service, 'id'>> = {
  deposit: {
    category: 'POSTAL',
    name: 'Deposit',
    description: 'Drop off a package or item',
    estWait: '~5 min',
  },
  shipping: {
    category: 'POSTAL',
    name: 'Shipping',
    description: 'Domestic and international shipping',
    estWait: '~8 min',
  },
  account_management: {
    category: 'ACCOUNT',
    name: 'Account Management',
    description: 'Account assistance',
    estWait: '~12 min',
  },
};

export default function ServiceSelectionPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [activeModalService, setActiveModalService] = useState<Service | null>(null);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [servicesLoading, setServicesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        await loginDevice();
        const data = await getServices();
        setServices(
          data.map((s) => ({
            id: s.id,
            ...(SERVICE_INFO[s.tag_name] ?? {
              category: 'OTHER',
              name: s.tag_name,
              description: '',
              estWait: '-',
            }),
          })),
        );
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Cannot reach the server');
      } finally {
        setServicesLoading(false);
      }
    };

    load();
  }, []);

  const handleGetTicket = async (serviceId: number | string) => {
    if (!activeModalService) return;
    setLoading(true);
    setError(null);
    try {
      const ticket = await createTicket(Number(serviceId));

      setTicketData({
        ticketCode: ticket.code,
        serviceName: activeModalService.name,
        estimatedWait: activeModalService.estWait,
      });
      setActiveModalService(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not generate ticket');
    
      setActiveModalService(null);
    } finally {
      setLoading(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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
                  <span className="text-xs text-slate-500">services available</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {servicesLoading ? (
              <p className="text-slate-500 text-sm">Loading services...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onSelect={(s) => setActiveModalService(s)}
                  />
                ))}
              </div>
            )}
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