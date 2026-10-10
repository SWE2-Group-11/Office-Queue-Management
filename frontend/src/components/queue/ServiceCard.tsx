import React from 'react';

interface Service {
  id: number | string;
  category: string;
  name: string;
  description: string;
  estWait: string;
}

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export default function ServiceCard({ service, onSelect }: ServiceCardProps) {
  // Helper to assign a clear text label and symbol for color-blind safety
  const getCategoryDetails = (category: string) => {
    switch (category.toUpperCase()) {
      case 'ACCOUNT':
        return { label: 'Account Service', symbol: '👤' };
      case 'POSTAL':
        return { label: 'Postal Service', symbol: '✉️' };
      case 'COLLECTION':
        return { label: 'Collection', symbol: '📦' };
      default:
        return { label: 'General Service', symbol: '📌' };
    }
  };

  const { label, symbol } = getCategoryDetails(service.category);

  return (
    <div 
      onClick={() => onSelect(service)}
      className="bg-white border-2 border-slate-300 hover:border-slate-900 rounded-xl p-6 text-left shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
      
        <div className="flex items-center space-x-2 mb-3">
          <span className="p-2 bg-slate-100 text-slate-800 rounded-lg border border-slate-300 text-lg leading-none" role="img" aria-label={label}>
            {symbol}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {label}
          </span>
        </div>

       
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {service.name}
        </h3>

     
        <p className="text-slate-600 text-base mt-2 leading-relaxed">
          {service.description}
        </p>
      </div>

     
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
        
        </div>
        
        <div className="flex items-center space-x-1 text-sm font-semibold text-slate-900 group-hover:translate-x-1 transition-transform">
          <span>Select</span>
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </div>
  );
}