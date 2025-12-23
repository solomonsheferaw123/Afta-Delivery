
import React, { useState, useEffect } from 'react';
import {
    Home, Search, ShoppingBag, Wallet, User as UserIcon,
    Bell, MapPin, ChevronRight, Star, Clock,
    Utensils, Truck, Users, LayoutGrid, Search as SearchIcon,
    Plus, Loader2, ArrowRight, CheckCircle2
} from 'lucide-react';
import { User, Partner } from '../types';
import { dataService } from '../services/dataService';
import { IMAGES } from '../imageRegistry';
import WalletWidget from './WalletWidget';

interface UserMobileAppProps {
    user: User | null;
    onLogout: () => void;
    onOpenLogin: () => void;
    onOpenService: (type: 'FOOD' | 'MART' | 'EXPRESS' | 'CONNECT') => void;
    onUserUpdate: (user: User) => void;
}

const UserMobileApp: React.FC<UserMobileAppProps> = ({ user, onLogout, onOpenLogin, onOpenService, onUserUpdate }) => {
    const [activeTab, setActiveTab] = useState<'HOME' | '探索' | 'ORDERS' | 'PROFILE'>('HOME');
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isWalletOpen, setIsWalletOpen] = useState(false);

    const [orders, setOrders] = useState<any[]>([]);
    const [isOrdersLoading, setIsOrdersLoading] = useState(false);
    const [trackingOrder, setTrackingOrder] = useState<any>(null);

    useEffect(() => {
        const fetchPartners = async () => {
            // ... (keep existing partner fetch)
            setIsLoading(true);
            const data = await dataService.getDashboardData();
            if (data && data.partners) {
                setPartners(data.partners.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    rating: parseFloat(p.rating),
                    category: p.category,
                    deliveryTime: p.delivery_time_estimate || '30 min',
                    image: p.image_url || IMAGES.sishu_burger
                })));
            }
            setIsLoading(false);
        };
        fetchPartners();
    }, []);

    useEffect(() => {
        if (activeTab === 'ORDERS' && user) {
            fetchOrders();
        }
    }, [activeTab, user]);

    const fetchOrders = async () => {
        setIsOrdersLoading(true);
        if (user) {
            const result = await dataService.getUserOrders(Number(user.id));
            if (result.success && result.orders) {
                setOrders(result.orders);
            }
        }
        setIsOrdersLoading(false);
    };

    const renderHome = () => (
        <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Header */}
            <div className="flex justify-between items-center px-4 pt-6">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#00843D] rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/20">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deliver to</p>
                        <h2 className="text-sm font-black text-gray-900 flex items-center gap-1">Addis Ababa, ET <ChevronRight size={14} className="text-[#00843D]" /></h2>
                    </div>
                </div>
                <button className="w-10 h-10 bg-white rounded-full border border-gray-100 flex items-center justify-center text-gray-600 relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#DA121A] rounded-full border-2 border-white"></span>
                </button>
            </div>

            {/* Hero Card */}
            <div className="px-4">
                <div className="bg-gradient-to-br from-[#00843D] to-[#006B31] rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl shadow-green-900/20 group">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">Afta Plus</span>
                        <h2 className="text-2xl font-black mt-3 leading-tight">Zero Delivery Fees <br />on your first <span className="text-[#FCDD09]">3 orders!</span></h2>
                        <button className="mt-4 bg-white text-[#00843D] px-6 py-2 rounded-xl text-xs font-black shadow-lg">Claim Now</button>
                    </div>
                    <img src={IMAGES.burger_thumb} className="absolute -right-4 bottom-0 w-32 h-32 object-contain opacity-40 group-hover:scale-110 transition-transform duration-500" alt="" />
                </div>
            </div>

            {/* Services Grid */}
            <div className="px-4 grid grid-cols-4 gap-4">
                {[
                    { id: 'FOOD', label: 'Food', icon: Utensils, color: 'bg-orange-50 text-orange-600' },
                    { id: 'MART', label: 'Mart', icon: ShoppingBag, color: 'bg-purple-50 text-purple-600' },
                    { id: 'EXPRESS', label: 'Express', icon: Truck, color: 'bg-blue-50 text-blue-600' },
                    { id: 'CONNECT', label: 'Connect', icon: Users, color: 'bg-green-50 text-green-600' },
                ].map((s) => (
                    <button
                        key={s.id}
                        onClick={() => onOpenService(s.id as any)}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className={`w-16 h-16 ${s.color} rounded-3xl flex items-center justify-center shadow-sm group-active:scale-95 transition-transform`}>
                            <s.icon size={28} />
                        </div>
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">{s.label}</span>
                    </button>
                ))}
            </div>

            {/* Wallet Quick Access */}
            <div className="px-4">
                <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-[#00843D]">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400">WALLET BALANCE</p>
                            <h3 className="text-lg font-black text-gray-900">{user?.wallet_balance?.toLocaleString() || '0.00'} <span className="text-[10px] font-normal opacity-50">ETB</span></h3>
                        </div>
                    </div>
                    <button
                        className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"
                        onClick={() => user && setIsWalletOpen(true)}
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* Popular Stores */}
            <div className="px-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900">Popular Near You</h3>
                    <button className="text-xs font-black text-[#00843D] uppercase">View All</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                    {partners.map((p) => (
                        <div key={p.id} className="min-w-[200px] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group active:scale-95 transition-transform">
                            <div className="h-28 relative">
                                <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                                    <Star size={10} fill="#FCDD09" className="text-[#FCDD09]" />
                                    <span className="text-[10px] font-black">{p.rating}</span>
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="font-black text-sm text-gray-900 truncate">{p.name}</h4>
                                <p className="text-[10px] text-gray-500 flex items-center gap-2 mt-1">
                                    <span className="font-bold">{p.category}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5"><Clock size={10} /> {p.deliveryTime}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="p-6 pb-24 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-8">My Account</h2>

            {user ? (
                <div className="space-y-8">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 bg-gray-100">
                            <img src={user.profile_image_url || IMAGES.user_1} className="w-full h-full object-cover" alt="Profile" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">{user.full_name}</h3>
                        <p className="text-gray-500 text-sm">{user.phone_number}</p>
                    </div>

                    <div className="space-y-3">
                        {[
                            { label: 'My Wallet', icon: Wallet, color: 'text-green-600 bg-green-50' },
                            { label: 'Saved Addresses', icon: MapPin, color: 'text-blue-600 bg-blue-50' },
                            { label: 'Notifications', icon: Bell, color: 'text-orange-600 bg-orange-50' },
                            { label: 'Settings', icon: Settings, color: 'text-gray-600 bg-gray-50' },
                        ].map((item, i) => (
                            <button key={i} className="w-full p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between group active:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center transition-colors`}><item.icon size={20} /></div>
                                    <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-300" />
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onLogout}
                        className="w-full py-4 bg-red-50 text-[#DA121A] rounded-2xl font-black text-sm active:bg-red-100 transition-colors mt-8"
                    >
                        Sign Out
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                        <UserIcon size={40} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Join Afta/አፍታ</h3>
                    <p className="text-gray-500 text-sm mb-6 px-10">Sign in to track orders, manage your wallet, and get personalized offers.</p>
                    <button
                        onClick={onOpenLogin}
                        className="bg-[#00843D] text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-green-900/20 active:scale-95 transition-transform"
                    >
                        Sign In / Register
                    </button>
                </div>
            )}
        </div>
    );

    const renderOrders = () => {
        const activeOrders = orders.filter(o => ['pending', 'accepted', 'shipping'].includes(o.status));
        const pastOrders = orders.filter(o => !['pending', 'accepted', 'shipping'].includes(o.status));

        return (
            <div className="pb-24 animate-in fade-in slide-in-from-bottom-5 duration-500 bg-gray-50 min-h-full">
                <div className="bg-white px-6 py-4 sticky top-0 z-10 shadow-sm">
                    <h2 className="text-2xl font-black text-gray-900">My Orders</h2>
                </div>

                {isOrdersLoading ? (
                    <div className="p-10 flex justify-center">
                        <Loader2 className="animate-spin text-[#00843D]" size={32} />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
                            <ShoppingBag size={40} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-2">No Orders Yet</h3>
                        <p className="text-gray-500 text-sm mb-6">Looks like you haven't placed any orders yet. Explore our partners to get started!</p>
                        <button
                            onClick={() => setActiveTab('HOME')}
                            className="bg-[#00843D] text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-green-900/20"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="p-4 space-y-6">
                        {/* Active Orders Section */}
                        {activeOrders.length > 0 && (
                            <div>
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Active Orders</h3>
                                <div className="space-y-4">
                                    {activeOrders.map(order => (
                                        <div key={order.id} className="bg-white p-4 rounded-3xl border border-[#00843D]/20 shadow-lg shadow-green-900/5 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 bg-green-50 rounded-bl-3xl">
                                                <div className="flex items-center gap-1.5 text-[#00843D]">
                                                    <span className="relative flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase">{order.status}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                                    <img src={order.partner_image || IMAGES.sishu_burger} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900">{order.partner_name || 'Unknown Partner'}</h4>
                                                    <p className="text-xs text-gray-500">Order #{order.id}</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                                <div className="flex justify-between items-center text-xs mb-1">
                                                    <span className="text-gray-500">Total Amount</span>
                                                    <span className="font-black text-gray-900">{order.total_amount} ETB</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-500">Items</span>
                                                    <span className="font-bold text-gray-700">{order.items?.length || 1} items</span>
                                                </div>
                                            </div>

                                            <button className="w-full py-3 bg-[#00843D] text-white rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                                onClick={() => {
                                                    setTrackingOrder(order);
                                                }}
                                            >
                                                Track Order <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Past Orders Section */}
                        {pastOrders.length > 0 && (
                            <div>
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Past Orders</h3>
                                <div className="space-y-3">
                                    {pastOrders.map(order => (
                                        <div key={order.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 active:bg-gray-50 transition-colors">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden grayscale opacity-80">
                                                <img src={order.partner_image || IMAGES.sishu_burger} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-900 text-sm">{order.partner_name}</h4>
                                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase">{order.status}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900 text-sm">{order.total_amount}</p>
                                                <p className="text-[10px] text-gray-400">ETB</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };
    const renderTrackingModal = () => {
        if (!trackingOrder) return null;

        const steps = [
            { id: 'PENDING', label: 'Order Placed', icon: ShoppingBag, color: 'bg-green-100 text-green-600' },
            { id: 'PREPARING', label: 'Preparing', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
            { id: 'READY', label: 'Ready for Pickup', icon: CheckCircle2, color: 'bg-blue-100 text-blue-600' },
            { id: 'DELIVERED', label: 'Delivered', icon: Home, color: 'bg-gray-100 text-gray-900' }
        ];

        const currentStepIndex = steps.findIndex(s => s.id === trackingOrder.status) === -1 ? 0 : steps.findIndex(s => s.id === trackingOrder.status);

        return (
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                    onClick={() => setTrackingOrder(null)}
                ></div>
                <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 pb-10 pointer-events-auto animate-in slide-in-from-bottom-full duration-300 relative">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Track Order</h3>
                            <p className="text-gray-500 text-sm">#{trackingOrder.id}</p>
                        </div>
                        <button onClick={() => setTrackingOrder(null)} className="p-2 bg-gray-50 rounded-full text-gray-500">
                            <ArrowRight className="rotate-90 sm:rotate-0" size={20} />
                        </button>
                    </div>

                    <div className="space-y-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[22px] top-4 bottom-4 w-0.5 bg-gray-100 z-0"></div>

                        {steps.map((step, idx) => {
                            const isCompleted = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;

                            return (
                                <div key={step.id} className={`flex items-center gap-4 relative z-10 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all duration-500 ${isCurrent ? 'scale-110 ring-4 ring-green-100 ' + step.color : (isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400')}`}>
                                        <step.icon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</h4>
                                        {isCurrent && <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider animate-pulse">In Progress</p>}
                                    </div>
                                    {isCompleted && !isCurrent && (
                                        <div className="ml-auto text-green-500">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-gray-50 flex flex-col font-sans overflow-hidden select-none">
            {/* iOS Status Bar Mockup */}
            <div className="bg-gray-50 px-8 pt-3 pb-2 flex justify-between items-center text-[10px] font-black text-gray-800">
                <span>9:41</span>
                <div className="flex gap-1.5 items-center">
                    <LayoutGrid size={12} className="rotate-90" />
                    <Users size={12} />
                    <div className="w-5 h-2.5 bg-gray-800 rounded-[2px] opacity-80 relative">
                        <div className="absolute top-0.5 left-0.5 bottom-0.5 right-1 bg-white/20 rounded-[1px]"></div>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto scrollbar-hide">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="animate-spin mb-4 text-[#00843D]" size={40} />
                        <p className="font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading Experience...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'HOME' && renderHome()}
                        {activeTab === 'PROFILE' && renderProfile()}
                        {activeTab === 'ORDERS' && renderOrders()}
                        {activeTab === '探索' && (
                            <div className="flex flex-col items-center justify-center h-full text-center p-10">
                                <Search size={48} className="text-gray-200 mb-4" />
                                <h3 className="text-lg font-black text-gray-900">Explore</h3>
                                <p className="text-sm text-gray-500 mt-2">Discover new dishes and trending items.</p>
                                <button onClick={() => setActiveTab('HOME')} className="mt-6 text-[#00843D] font-black underline">Go back home</button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Bottom Tab Bar */}
            <div className="fixed bottom-6 left-6 right-6 h-20 bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[32px] flex items-center justify-around px-2 z-50">
                {[
                    { id: 'HOME', icon: Home, label: 'Home' },
                    { id: '探索', icon: SearchIcon, label: 'Explore' },
                    { id: 'ORDERS', icon: ShoppingBag, label: 'Orders' },
                    { id: 'PROFILE', icon: UserIcon, label: 'Profile' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'text-[#00843D]' : 'text-gray-400'}`}
                    >
                        {activeTab === tab.id && (
                            <div className="absolute inset-0 bg-green-50 rounded-2xl animate-in zoom-in-90 duration-300"></div>
                        )}
                        <div className="relative z-10 flex flex-col items-center">
                            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                            <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">{tab.label}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1bg-gray-900 rounded-full opacity-20"></div>

            {/* Wallet Top-up Overlay (Mobile) */}
            {user && isWalletOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsWalletOpen(false)}
                    ></div>
                    <div className="relative w-full max-w-sm">
                        <WalletWidget
                            user={user}
                            onBalanceUpdate={(updatedUser) => {
                                onUserUpdate(updatedUser);
                                setIsWalletOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Tracking Modal */}
            {renderTrackingModal()}
        </div>
    );
};

export default UserMobileApp;
