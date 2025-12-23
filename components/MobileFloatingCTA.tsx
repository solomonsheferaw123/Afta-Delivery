import React, { useEffect, useState } from 'react';
import { Download, Phone } from 'lucide-react';
import { getVariant } from '../utils/abTesting';

const MobileFloatingCTA: React.FC = () => {
  const [btnVariant, setBtnVariant] = useState('control');

  useEffect(() => {
    // TEST B: APP DOWNLOAD BUTTON
    // Control: Green button "Download App"
    // Variation 1: Yellow button "Get the App"
    const variant = getVariant('mobile-cta-btn-001', ['control', 'variation1']);
    setBtnVariant(variant);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 lg:hidden flex gap-3 animate-in slide-in-from-bottom-full duration-500 safe-area-bottom">
      <button 
        onClick={() => window.location.href = 'tel:9898'}
        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
      >
        <Phone size={18} />
        <span>Call 9898</span>
      </button>
      
      {btnVariant === 'variation1' ? (
         <button 
           onClick={() => alert('App download starting...')}
           className="flex-[2] flex items-center justify-center gap-2 bg-[#FCDD09] text-yellow-900 font-bold py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition-colors"
         >
           <Download size={18} />
           <span>Get the App</span>
         </button>
      ) : (
         <button 
           onClick={() => alert('App download starting...')}
           className="flex-[2] flex items-center justify-center gap-2 bg-[#00843D] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#006B31] transition-colors"
         >
           <Download size={18} />
           <span>Download App</span>
         </button>
      )}
    </div>
  );
};

export default MobileFloatingCTA;