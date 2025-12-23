import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, Truck, Clock, Calculator, ArrowRight, Bike, Loader2, CheckCircle2 } from 'lucide-react';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';

interface ExpressWidgetProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExpressWidget: React.FC<ExpressWidgetProps> = ({ isOpen, onClose }) => {
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [packageType, setPackageType] = useState('PARCEL');
    const [vehicle, setVehicle] = useState('MOTORBIKE');
    const [price, setPrice] = useState(0);
    const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS'>('IDLE');

    // Mock Price Calculation
    useEffect(() => {
        let basePrice = 50;
        if (vehicle === 'BIKE') basePrice = 30;
        if (vehicle === 'VAN') basePrice = 150;

        let typeMultiplier = 1;
        if (packageType === 'DOCUMENT') typeMultiplier = 0.8;
        if (packageType === 'CARGO') typeMultiplier = 2.0;

        // Simulate distance factor with random wrapper for demo feel
        const distancePrice = (pickup && dropoff) ? 120 : 0;

        setPrice(Math.floor(basePrice * typeMultiplier + distancePrice));
    }, [pickup, dropoff, packageType, vehicle]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-[#00843D] p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-startrelative z-10">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Truck className="text-[#FCDD09]" /> Afta Express
                            </h2>
                            <p className="text-green-100 text-sm mt-1">Send anything, anywhere in Addis.</p>
                        </div>
                        <button onClick={onClose} className="p-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Location Inputs */}
                    <div className="space-y-4">
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 text-green-600" size={20} />
                            <input
                                type="text"
                                placeholder="Pickup Location"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00843D] outline-none font-medium"
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 text-red-500" size={20} />
                            <input
                                type="text"
                                placeholder="Dropoff Destination"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00843D] outline-none font-medium"
                                value={dropoff}
                                onChange={(e) => setDropoff(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Package Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Package Type</label>
                            <div className="flex flex-col gap-2">
                                {['DOCUMENT', 'PARCEL', 'CARGO'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setPackageType(type)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${packageType === type ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Vehicle</label>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setVehicle('BIKE')}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 transition-all ${vehicle === 'BIKE' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Bike size={14} /> Bicycle
                                </button>
                                <button
                                    onClick={() => setVehicle('MOTORBIKE')}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 transition-all ${vehicle === 'MOTORBIKE' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Bike size={14} /> Motorbike
                                </button>
                                <button
                                    onClick={() => setVehicle('VAN')}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 transition-all ${vehicle === 'VAN' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Truck size={14} /> Van / Truck
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Estimation */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Estimated Cost</p>
                            <h3 className="text-2xl font-black text-gray-900">{price} <span className="text-sm font-normal text-gray-500">ETB</span></h3>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Time</p>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1 justify-end"><Clock size={16} className="text-blue-500" /> ~45 min</h3>
                        </div>
                    </div>

                    <button
                        disabled={!pickup || !dropoff || status !== 'IDLE'}
                        onClick={async () => {
                            const user = authService.getCurrentUser();
                            if (!user) return alert("Please login");
                            setStatus('PENDING');
                            const res = await dataService.requestExpress({
                                userId: Number(user.id),
                                pickup,
                                dropoff,
                                type: packageType,
                                vehicle,
                                price
                            });
                            if (res.success) {
                                setStatus('SUCCESS');
                                setTimeout(() => {
                                    setStatus('IDLE');
                                    onClose();
                                }, 2000);
                            } else {
                                alert("Failed to book courier");
                                setStatus('IDLE');
                            }
                        }}
                        className="w-full bg-[#00843D] hover:bg-[#006B31] text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {status === 'PENDING' ? <Loader2 className="animate-spin" /> : status === 'SUCCESS' ? <CheckCircle2 /> : 'Request Courier'} {status === 'IDLE' && <ArrowRight size={20} />}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ExpressWidget;
