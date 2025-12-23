import React from 'react';
import { Search, Map, Heart } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: 'Browse & Order',
      description: 'Search for your favorite restaurants, groceries, or items. Filter by delivery time or rating.',
      icon: Search,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 2,
      title: 'Track Live',
      description: 'Watch your courier moving in real-time on the map. Get updates at every step.',
      icon: Map,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 3,
      title: 'Enjoy & Rate',
      description: 'Receive your order at your doorstep. Rate your experience to help us improve.',
      icon: Heart,
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[#00843D] font-bold tracking-widest uppercase text-sm mb-2">How It Works</h2>
          <h3 className="text-3xl font-extrabold text-gray-900">Simple 3-Step Process</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-100 -z-10"></div>

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative flex flex-col items-center text-center group">
                <div className={`w-24 h-24 rounded-full ${step.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10 border-4 border-white`}>
                  <Icon size={32} />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                    {step.id}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                <p className="text-gray-600 leading-relaxed max-w-xs">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;