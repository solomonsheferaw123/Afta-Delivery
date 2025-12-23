import React, { useMemo } from 'react';
import { X, MapPin, Bike, CheckCircle2, Clock, Phone, MessageSquare } from 'lucide-react';

interface TrackingWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  order?: any;
}

const TrackingWidget: React.FC<TrackingWidgetProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen) return null;

  const statusStep = useMemo(() => {
    const status = (order?.status || '').toLowerCase();
    if (status === 'pending' || status === 'confirmed') return 1;
    if (status === 'preparing') return 2;
    if (status === 'delivering') return 3;
    if (status === 'completed') return 4;
    return 1;
  }, [order]);

  const steps = [
    { id: 1, title: 'Order Confirmed', time: order ? new Date(order.created_at).toLocaleTimeString() : '' },
    { id: 2, title: 'Preparing', time: '' },
    { id: 3, title: 'On the way', time: '' },
    { id: 4, title: 'Delivered', time: '' }
  ];

  const headerTitle =
    order && order.status === 'completed'
      ? 'Order delivered'
      : order && order.status === 'delivering'
      ? 'Arriving soon'
      : 'We are processing your order';

  const headerSubtitle = order
    ? `Order #${order.id} • ${order.partner_name}`
    : 'Live delivery preview';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        
        {/* Map Header */}
        <div className="h-48 bg-gray-100 relative">
          <div className="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Addis_Ababa_OpenStreetMap.png/640px-Addis_Ababa_OpenStreetMap.png')] bg-cover bg-center"></div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md z-20 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
          
          {/* Courier Pin */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-[5000ms]">
             <div className="relative">
                <div className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-[#00843D] z-10 relative">
                   <Bike size={24} className="text-[#00843D]" />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-black/20 rounded-full blur-sm"></div>
             </div>
          </div>
        </div>

        {/* Status Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
               <h3 className="font-bold text-lg text-gray-900">{headerTitle}</h3>
               <p className="text-gray-500 text-sm">{headerSubtitle}</p>
            </div>
            {order?.partner_image && (
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                 <img src={order.partner_image} alt={order.partner_name} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="relative pl-8 space-y-8 mb-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
            {steps.map((step) => (
              <div key={step.id} className="relative">
                <div className={`absolute -left-[29px] w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white transition-colors duration-500 ${step.id <= statusStep ? 'border-[#00843D] text-[#00843D]' : 'border-gray-300 text-gray-300'}`}>
                  {step.id < statusStep ? <CheckCircle2 size={14} /> : (step.id === statusStep ? <div className="w-2 h-2 bg-[#00843D] rounded-full animate-ping" /> : <div className="w-2 h-2 bg-gray-300 rounded-full" />)}
                </div>
                <div className={`transition-opacity duration-500 ${step.id <= statusStep ? 'opacity-100' : 'opacity-40'}`}>
                  <p className="font-bold text-sm text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Courier Info */}
          <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <img src="https://i.pravatar.cc/150?u=courier" alt="Courier" className="w-10 h-10 rounded-full border border-white shadow-sm" />
               <div>
                  <p className="font-bold text-sm text-gray-900">Dawit (Courier)</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                     <span className="text-yellow-500">★</span> 4.9 • Motorcycle
                  </p>
               </div>
            </div>
            <div className="flex gap-2">
               <button className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-[#00843D]">
                  <MessageSquare size={18} />
               </button>
               <button className="p-2 bg-[#00843D] text-white rounded-full hover:bg-[#006B31] shadow-lg shadow-green-900/20">
                  <Phone size={18} />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingWidget;