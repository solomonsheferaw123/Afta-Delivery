import React from 'react';
import { Briefcase, Gavel, Code, Rocket, TrendingUp, CheckCircle2, Clock, Smartphone, Globe, Wallet } from 'lucide-react';

const Roadmap = () => {
  const phases = [
    {
      id: 1,
      title: "Foundation & Launch",
      timeframe: "Weeks 1-8 (Completed)",
      icon: CheckCircle2,
      color: "bg-green-600",
      status: "completed",
      items: [
        "Registered 'Afta/አፍታ Delivery PLC'",
        "MVP Beta Testing",
        "Secured $29k Pre-Seed",
        "Initial 8 Partners Signed"
      ]
    },
    {
      id: 2,
      title: "Market Validation",
      timeframe: "Weeks 9-12 (Completed)",
      icon: CheckCircle2,
      color: "bg-green-600",
      status: "completed",
      items: [
        "Android App Live (2k+ Users)",
        "Expanded to Kazanchis",
        "Achieved Profitability",
        "4,000+ Orders Delivered"
      ]
    },
    {
      id: 3,
      title: "Super-App Evolution",
      timeframe: "Weeks 13-20 (Active)",
      icon: Smartphone,
      color: "bg-purple-500",
      status: "active",
      items: [
        "Launch Afta/አፍታ Mart (Marketplace)",
        "Afta/አፍታ Pay Wallet Integration",
        "Corporate Platform Pilot",
        "Series A Prep ($2M Target)"
      ]
    },
    {
      id: 4,
      title: "National Scale",
      timeframe: "Weeks 21-36 (Planned)",
      icon: Globe,
      color: "bg-gray-400",
      status: "planned",
      items: [
        "Expansion to 5 Regional Cities",
        "Full Logistics Network",
        "East Africa Pilot",
        "IPO Readiness"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-amber-600 font-bold tracking-widest uppercase text-sm mb-2">Strategic Roadmap</h2>
          <h3 className="text-3xl font-extrabold text-gray-900">From Delivery to Super-App</h3>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            We are building the operating system for Ethiopian commerce. Currently executing Phase 5: Digital Ecosystem.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200 rounded-full"></div>

          <div className="space-y-12">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isEven = index % 2 === 0;
              const isCompleted = phase.status === 'completed';
              const isActive = phase.status === 'active';

              return (
                <div key={phase.id} className={`flex flex-col md:flex-row items-center justify-between ${isEven ? '' : 'md:flex-row-reverse'}`}>

                  {/* Content Box */}
                  <div className="w-full md:w-5/12 mb-8 md:mb-0">
                    <div className={`p-6 rounded-2xl shadow-sm border transition-shadow relative ${isActive ? 'bg-white border-purple-200 shadow-md ring-2 ring-purple-100' : 'bg-white border-gray-100'}`}>
                      {/* Arrow for Desktop */}
                      <div className={`hidden md:block absolute top-1/2 transform -translate-y-1/2 w-4 h-4 border-t border-r rotate-45 ${isEven ? '-right-2.5 border-l-0 border-b-0' : '-left-2.5 border-t-0 border-r-0 border-b border-l'} ${isActive ? 'bg-white border-purple-200' : 'bg-white border-gray-100'}`}></div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${phase.color} bg-opacity-10`}>
                          <Icon size={20} className={phase.color.replace('bg-', 'text-')} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            {phase.title}
                            {isActive && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Active</span>}
                          </h4>
                          <span className={`text-xs font-bold uppercase tracking-wide ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>{phase.timeframe}</span>
                        </div>
                      </div>

                      <ul className="space-y-2">
                        {phase.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            {isCompleted ? (
                              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                            ) : isActive ? (
                              <Wallet size={16} className="text-purple-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                            )}
                            <span className={isCompleted ? 'line-through text-gray-400' : ''}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Center Dot */}
                  <div className={`absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full z-10 shadow-sm top-0 md:top-auto border-4 ${isCompleted ? 'bg-green-500 border-green-100' : isActive ? 'bg-purple-500 border-purple-100' : 'bg-white border-gray-200'}`}>
                    {isCompleted && <CheckCircle2 size={16} className="text-white" />}
                    {isActive && <TrendingUp size={16} className="text-white" />}
                  </div>

                  {/* Empty Space for alignment */}
                  <div className="w-full md:w-5/12 hidden md:block"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;