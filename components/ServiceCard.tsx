import React from 'react';
import { Clock } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceCardProps {
  item: ServiceItem;
  colorClass: string;
  onClick?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ item, colorClass, onClick }) => {
  const IconComponent = item.Icon;

  return (
    <div className="group flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 overflow-hidden">
      <div className={`h-2 w-full ${colorClass}`}></div>
      <div className="p-8 flex-1 flex flex-col">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${colorClass.replace('bg-', 'bg-opacity-10 text-')}`}>
          <IconComponent className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
        <p className="text-amber-600 font-medium text-sm mb-3 flex items-center gap-1">
          <Clock size={14} />
          {item.deliveryTime}
        </p>
        <p className="text-gray-600 leading-relaxed text-sm mb-6 flex-1">{item.description}</p>
        
        <button
          type="button"
          onClick={onClick}
          className="w-full py-2.5 rounded-lg border-2 border-gray-100 text-gray-700 font-bold text-sm hover:border-amber-500 hover:text-amber-600 transition-colors"
        >
          {item.cta}
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;