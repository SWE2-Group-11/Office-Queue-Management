import React from 'react';

interface Service {
  id: number | string;
  name: string;
  description: string;
  estWait: string;
}

interface ModalProps {
  service: Service | null;
  onClose: () => void;
  onConfirm: (service_id: number | string) => void;
  loading: boolean;
}

export default function ServiceConfirmationModal({ service, onClose, onConfirm, loading }: ModalProps) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
   
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 border-2 border-slate-300 shadow-2xl text-left">
        
      
        <div className="flex items-center space-x-3 mb-4">
          <span className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center text-lg font-bold border border-slate-300 shrink-0" role="img" aria-label="Confirmation">
            📌
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Action Required
          </span>
        </div>

       
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Confirm Your Service Selection
        </h2>
        
        <p className="text-slate-600 text-base mt-2">
          You are about to get a ticket for the following service:
        </p>

      
        <div className="mt-6 p-5 bg-slate-50 rounded-xl border-2 border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
          <p className="text-slate-600 text-sm mt-1">{service.description}</p>
       
        </div>

      
        <div className="mt-8 flex items-center justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={() => onConfirm(service.id)}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Confirm & Get Ticket'}
          </button>
        </div>

      </div>
    </div>
  );
}