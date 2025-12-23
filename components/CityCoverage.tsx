import React from 'react';
import { MapPin, Users, Store, Bike } from 'lucide-react';

const CityCoverage: React.FC = () => {
  const cities = [
    {
      name: 'Addis Ababa',
      status: 'Live',
      stats: { partners: '89+', couriers: '300+', users: '68k' },
      // Cityscape of Addis
      image: 'https://images.unsplash.com/photo-1542317854-f9ebf356d432?q=80&w=800&auto=format&fit=crop',
      active: true
    },
    {
      name: 'Dire Dawa',
      status: 'Coming Soon',
      stats: { partners: '12', couriers: '45', users: '2k' },
      // Eastern Ethiopia vibe (Harar/Dire Dawa architecture)
      image: 'https://images.unsplash.com/photo-1519233991914-26a44330ccd7?q=80&w=800&auto=format&fit=crop',
      active: false
    },
    {
      name: 'Bahir Dar',
      status: 'Planned',
      stats: { partners: '-', couriers: '-', users: '-' },
      // Nature/Lake Tana/Blue Nile vibe
      image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?q=80&w=800&auto=format&fit=crop',
      active: false
    }
  ];

  return (
    <section className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-[#DA121A] font-bold tracking-widest uppercase text-sm mb-2">Expansion</h2>
            <h3 className="text-3xl font-extrabold text-gray-900">Serving Ethiopia</h3>
            <p className="mt-2 text-gray-600">We are rapidly expanding our delivery network across the nation.</p>
          </div>
          <button className="text-[#00843D] font-bold hover:underline mt-4 md:mt-0">View Coverage Map</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cities.map((city) => (
            <div key={city.name} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="h-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <img 
                  src={city.image} 
                  alt={city.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <h4 className="text-white font-bold text-xl flex items-center gap-2">
                    <MapPin size={18} className="text-[#FCDD09]" />
                    {city.name}
                  </h4>
                </div>
                <div className="absolute top-4 right-4 z-20">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${city.active ? 'bg-[#00843D] text-white' : 'bg-gray-800 text-white'}`}>
                    {city.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-100">
                  <div>
                    <div className="text-gray-400 mb-1 flex justify-center"><Store size={16} /></div>
                    <div className="font-bold text-gray-900">{city.stats.partners}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Partners</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1 flex justify-center"><Bike size={16} /></div>
                    <div className="font-bold text-gray-900">{city.stats.couriers}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Couriers</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1 flex justify-center"><Users size={16} /></div>
                    <div className="font-bold text-gray-900">{city.stats.users}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Users</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CityCoverage;