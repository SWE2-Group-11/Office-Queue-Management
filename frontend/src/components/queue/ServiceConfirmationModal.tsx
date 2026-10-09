import React from 'react';

interface Service {
  id: number | string;
  category: string;
  name: string;
  description: string;
  estWait: string;
}

interface ServiceConfirmationModalProps {
  service: Service | null;
  onClose: () => void;
  onConfirm: (serviceId: number | string) => void;
  loading: boolean;
}

export default function ServiceConfirmationModal({ 
  service, 
  onClose, 
  onConfirm, 
  loading 
}: ServiceConfirmationModalProps) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

       
        <div className="text-left mb-6">
          <div className="flex items-center space-x-2 text-sky-600 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs font-extrabold tracking-wider">{service.category} SERVICES</span>
          </div>

          <p className="text-xs text-slate-500">You selected</p>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">{service.name}</h2>
          <p className="text-sm text-slate-600 mt-1">{service.description}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onConfirm(service.id)}
            disabled={loading}
            className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span>{loading ? 'Processing...' : 'Get my ticket'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 text-slate-700 hover:bg-slate-50 rounded-2xl font-semibold transition-colors text-sm"
          >
            Choose another service
          </button>
        </div>

      </div>
    </div>
  );
}