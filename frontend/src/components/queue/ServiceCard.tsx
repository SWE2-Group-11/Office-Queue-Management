import React from 'react';

interface Service {
  id: number | string;
  category: string;
  name: string;
  description: string;
  estWait: string;
  theme?: string;
  
}

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export default function ServiceCard({ service, onSelect }: ServiceCardProps) {
  const isBlue = service.theme === 'blue' || service.category === 'ACCOUNT';

  return (
    <div 
      onClick={() => onSelect(service)}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer p-8 flex flex-col justify-between group relative overflow-hidden text-left"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start space-x-4">
       
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isBlue ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>

        
          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold tracking-wider ${isBlue ? 'text-sky-600' : 'text-emerald-600'}`}>
                {service.category}
              </span>
             
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 group-hover:text-sky-600 transition-colors">
              {service.name}
            </h3>
            <p className="text-slate-600 text-sm mt-2 text-left">{service.description}</p>
          </div>
        </div>

      
        <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}