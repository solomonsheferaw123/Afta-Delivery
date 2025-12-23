
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, ShoppingBag, Utensils, DollarSign,
    Settings, Bell, CheckCircle2, Clock, X, Plus,
    TrendingUp, Star, ChevronRight, Menu as MenuIcon,
    Search, Filter, ArrowUpRight, Loader2, User as UserIcon
} from 'lucide-react';
import { User, RestaurantOrder, MenuItem } from '../types';
import { dataService } from '../services/dataService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface PartnerMobileAppProps {
    user: User;
    onLogout: () => void;
}

const PartnerMobileApp: React.FC<PartnerMobileAppProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ORDERS' | 'MENU' | 'PROFILE'>('DASHBOARD');
    const [orders, setOrders] = useState<RestaurantOrder[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Main',
        image_url: '',
        image_preview: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ordersRes, products] = await Promise.all([
                dataService.getPartnerOrders(Number(user.id)),
                dataService.getProducts(user.id)
            ]);

            if (ordersRes.success) {
                setOrders(ordersRes.orders || []);
            }
            setMenuItems(products);
        } catch (error) {
            console.error("Failed to fetch partner data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    };

    const updateOrderStatus = async (id: string, newStatus: RestaurantOrder['status']) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    const toggleItemAvailability = async (item: MenuItem) => {
        const updatedStatus = !item.is_available;
        try {
            const result = await dataService.updateProduct(item.id, {
                ...item,
                is_available: updatedStatus
            });
            if (result.success) {
                setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, is_available: updatedStatus } : m));
            }
        } catch (error) {
            console.error("Failed to toggle availability:", error);
        }
    };

    const earningsData = [
        { name: 'Mon', amount: 4500 },
        { name: 'Tue', amount: 3200 },
        { name: 'Wed', amount: 5100 },
        { name: 'Thu', amount: 4800 },
        { name: 'Fri', amount: 8500 },
        { name: 'Sat', amount: 9200 },
        { name: 'Sun', amount: 7800 },
    ];

    const resetForm = () => {
        setNewItem({ name: '', description: '', price: '', category: 'Main', image_url: '', image_preview: '' });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItem({ ...newItem, image_url: reader.result as string, image_preview: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await dataService.addProduct({
                partnerId: Number(user.id),
                name: newItem.name,
                description: newItem.description,
                price: Number(newItem.price),
                category: newItem.category,
                image_url: newItem.image_url
            });

            if (result.success) {
                setMenuItems([result.product, ...menuItems]);
                setIsAddModalOpen(false);
                resetForm();
            } else {
                alert(result.error || "Failed to add item");
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDashboard = () => (
        <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Header */}
            <div className="flex justify-between items-center px-4 pt-6">
                <div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Good Morning</p>
                    <h1 className="text-2xl font-black text-gray-900">{user.full_name.split(' ')[0]} 👋</h1>
                </div>
                <div className="relative">
                    <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600">
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#DA121A] rounded-full border-2 border-white"></span>
                    </button>
                </div>
            </div>

            {/* Main Stats Card */}
            <div className="px-4">
                <div className="bg-gradient-to-br from-[#00843D] to-[#006B31] rounded-3xl p-6 text-white shadow-xl shadow-green-900/20 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">Today's Revenue</span>
                            <TrendingUp size={16} className="text-[#FCDD09]" />
                        </div>
                        <h2 className="text-4xl font-black mb-1">4,250 <span className="text-lg font-normal opacity-70">ETB</span></h2>
                        <p className="text-sm opacity-80 flex items-center gap-1">
                            <span className="text-[#FCDD09] font-bold">+12%</span> vs yesterday
                        </p>

                        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] uppercase opacity-70 tracking-wider">Orders</p>
                                <p className="text-xl font-bold">{orders.length}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase opacity-70 tracking-wider">Rating</p>
                                <p className="text-xl font-bold flex items-center gap-1">4.8 <Star size={14} fill="#FCDD09" className="text-[#FCDD09]" /></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="px-4">
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Weekly Performance</h3>
                        <button className="text-xs font-bold text-[#00843D] flex items-center gap-1">Detail <ChevronRight size={14} /></button>
                    </div>
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={earningsData}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00843D" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00843D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#00843D" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4">
                <h3 className="font-bold text-gray-800 mb-4 px-1">Quick Actions</h3>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Add Item', icon: Plus, color: 'bg-blue-50 text-blue-600', onClick: () => setIsAddModalOpen(true) },
                        { label: 'Orders', icon: ShoppingBag, color: 'bg-orange-50 text-orange-600' },
                        { label: 'Review', icon: Star, color: 'bg-yellow-50 text-yellow-600' },
                        { label: 'Payout', icon: DollarSign, color: 'bg-green-50 text-green-600' },
                    ].map((action, i) => (
                        <button key={i} onClick={action.onClick} className="flex flex-col items-center gap-2 group">
                            <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center shadow-sm group-active:scale-95 transition-transform`}>
                                <action.icon size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Orders */}
            <div className="px-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 px-1">Live Orders</h3>
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                </div>
                <div className="space-y-3">
                    {orders.filter(o => o.status !== 'DELIVERED').slice(0, 3).map((order) => (
                        <div key={order.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group active:bg-gray-50 transition-colors">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-black text-[#00843D]">
                                #{order.id.toString().slice(-3)}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 text-sm">{order.customer_name}</p>
                                <p className="text-xs text-gray-500">{order.items.length} items • {order.total_amount} ETB</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {order.status}
                                </span>
                                <p className="text-[10px] text-gray-400 mt-1 flex items-center justify-end gap-1"><Clock size={10} /> 5m ago</p>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <ShoppingBag size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-xs text-gray-500 font-bold">No active orders</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="pb-24 animate-in fade-in duration-300">
            <div className="p-4 pt-6 sticky top-0 bg-gray-50 z-10 flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-900">Orders</h2>
                <button onClick={handleRefresh} className={`p-2 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`}>
                    <Clock size={20} />
                </button>
            </div>

            <div className="px-4 flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {['ALL', 'PENDING', 'PREPARING', 'READY', 'DELIVERED'].map((filter) => (
                    <button key={filter} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filter === 'ALL' ? 'bg-[#00843D] text-white border-[#00843D]' : 'bg-white text-gray-500 border-gray-200'
                        }`}>
                        {filter}
                    </button>
                ))}
            </div>

            <div className="px-4 space-y-4 mt-2">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs font-black text-gray-500">
                                    #{order.id.toString().slice(-4)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{order.customer_name}</p>
                                    <p className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10} /> Today, 10:45 AM</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-[#00843D]">{order.total_amount} Br</p>
                                <span className="text-[10px] text-gray-400 font-medium">Digital Payment</span>
                            </div>
                        </div>

                        <div className="p-4 space-y-2">
                            {order.items.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <p className="text-gray-600"><span className="font-bold text-gray-900">{item.quantity}x</span> {item.name}</p>
                                    <p className="text-gray-400 text-xs">{item.price} Br</p>
                                </div>
                            ))}
                        </div>

                        <div className="px-4 pb-4 flex gap-2">
                            {order.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                                        className="flex-1 py-3 bg-[#00843D] text-white rounded-xl font-bold text-sm shadow-lg shadow-green-900/10"
                                    >
                                        Accept Order
                                    </button>
                                    <button className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm">Reject</button>
                                </>
                            )}
                            {order.status === 'PREPARING' && (
                                <button
                                    onClick={() => updateOrderStatus(order.id, 'READY')}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm"
                                >
                                    Mark as Ready
                                </button>
                            )}
                            {order.status === 'READY' && (
                                <div className="w-full py-3 bg-gray-50 text-gray-400 rounded-xl font-bold text-sm text-center border border-gray-100">Waiting for Courier</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-50 flex flex-col font-sans overflow-hidden select-none">
            {/* Notch / Status Bar Mockup */}
            <div className="bg-gray-50 px-6 pt-3 pb-2 flex justify-between items-center text-[10px] font-bold text-gray-800">
                <span>10:07</span>
                <div className="flex gap-1.5 items-center">
                    <MenuIcon size={12} className="rotate-90" />
                    <span>LTE</span>
                    <div className="w-5 h-2.5 bg-gray-800 rounded-[2px] opacity-80 relative">
                        <div className="absolute top-0.5 left-0.5 bottom-0.5 right-1 bg-white/20 rounded-[1px]"></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="animate-spin mb-4 text-[#00843D]" size={40} />
                        <p className="font-bold animate-pulse">Powering up your store...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'DASHBOARD' && renderDashboard()}
                        {activeTab === 'ORDERS' && renderOrders()}
                        {activeTab === 'MENU' && (
                            <div className="p-4 pt-6 pb-24 animate-in fade-in duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-gray-900">Menu Editor</h2>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="w-10 h-10 bg-[#00843D] text-white rounded-full flex items-center justify-center shadow-lg shadow-green-900/20"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 flex gap-1 mb-6">
                                    {['All Items', 'Categories', 'Modifiers'].map((tab) => (
                                        <button key={tab} className={`flex-1 py-2 text-xs font-bold rounded-2xl transition-all ${tab === 'All Items' ? 'bg-[#00843D] text-white shadow-sm' : 'text-gray-400'}`}>
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {menuItems.map((item) => (
                                        <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative">
                                            <div className="h-28 bg-gray-100 relative">
                                                <img src={item.image_url} alt={item.name} className={`w-full h-full object-cover ${!item.is_available ? 'grayscale opacity-50' : ''}`} />
                                                {!item.is_available && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                        <span className="bg-[#DA121A] text-white text-[8px] font-black px-2 py-0.5 rounded-full">OFFLINE</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                                                <p className="text-[#00843D] font-black text-xs mt-1">{item.price} Br</p>
                                                <div className="mt-3 flex gap-1">
                                                    <button className="flex-1 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold">Edit</button>
                                                    <button
                                                        onClick={() => toggleItemAvailability(item)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${item.is_available ? 'bg-[#DA121A]' : 'bg-[#00843D]'}`}
                                                    >
                                                        {item.is_available ? <X size={14} /> : <CheckCircle2 size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'PROFILE' && (
                            <div className="p-4 pt-6 pb-24 animate-in fade-in duration-300">
                                <h2 className="text-2xl font-black text-gray-900 mb-8">Account</h2>

                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-3">
                                        <img src={user.profile_image_url || 'https://i.pravatar.cc/150?u=5'} className="w-full h-full object-cover" alt="Profile" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{user.full_name}</h3>
                                    <p className="text-gray-500 text-sm">Restaurant Partner #4492</p>
                                </div>

                                <div className="space-y-2">
                                    {[
                                        { label: 'Store Information', icon: Utensils },
                                        { label: 'Payment Methods', icon: DollarSign },
                                        { label: 'Operational Hours', icon: Clock },
                                        { label: 'Security & Privacy', icon: Settings },
                                        { label: 'Help Center', icon: Bell },
                                    ].map((item, i) => (
                                        <button key={i} className="w-full p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between group active:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#00843D] transition-colors"><item.icon size={20} /></div>
                                                <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                            </div>
                                            <ChevronRight size={18} className="text-gray-300" />
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={onLogout}
                                    className="w-full mt-8 py-4 bg-red-50 text-[#DA121A] rounded-2xl font-black text-sm active:bg-red-100 transition-colors"
                                >
                                    Log Out
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modern Floating Tab Bar */}
            <div className="fixed bottom-6 left-6 right-6 h-16 bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[32px] flex items-center justify-around px-2 z-50">
                {[
                    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Home' },
                    { id: 'ORDERS', icon: ShoppingBag, label: 'Orders', badge: orders.filter(o => o.status === 'PENDING').length },
                    { id: 'MENU', icon: Utensils, label: 'Menu' },
                    { id: 'PROFILE', icon: UserIcon, label: 'Me' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'text-[#00843D]' : 'text-gray-400'
                            }`}
                    >
                        {activeTab === tab.id && (
                            <div className="absolute inset-0 bg-green-50 rounded-2xl animate-in zoom-in-90 duration-300"></div>
                        )}
                        <div className="relative z-10">
                            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                            {tab.badge ? (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DA121A] text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">{tab.badge}</span>
                            ) : null}
                        </div>
                    </button>
                ))}
            </div>

            {/* Add Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
                            <h3 className="font-black text-xl">Add New Item</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto pb-10">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Product Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                        {newItem.image_preview ? (
                                            <img src={newItem.image_preview} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <Plus className="text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer bg-[#E6F3EA] text-[#00843D] px-4 py-2.5 rounded-xl text-xs font-black hover:bg-green-100 transition-colors inline-block">
                                            Select Photo
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                        <p className="text-[10px] text-gray-400 mt-2">Will be visible to customers</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00843D] outline-none text-sm font-bold"
                                    placeholder="e.g. Special Tibs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price (Br)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00843D] outline-none text-sm font-bold"
                                        placeholder="350"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                    <select
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00843D] outline-none text-sm font-bold"
                                    >
                                        <option value="Main">Main</option>
                                        <option value="Fast Food">Fast Food</option>
                                        <option value="Drinks">Drinks</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00843D] outline-none h-24 resize-none text-sm font-bold"
                                    placeholder="Describe your dish..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-[#00843D] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#006B31] shadow-xl shadow-green-900/20 disabled:opacity-50 mt-4"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                {isSubmitting ? 'Adding...' : 'Add to Menu'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Home Indicator Mockup */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-gray-900 rounded-full opacity-20"></div>
        </div>
    );
};

export default PartnerMobileApp;
