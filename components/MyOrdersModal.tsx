import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle2, ChevronRight, ShoppingBag, MapPin, RefreshCw, Loader2 } from 'lucide-react';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';

interface MyOrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTrackOrder?: (order: any) => void;
}

const MyOrdersModal: React.FC<MyOrdersModalProps> = ({ isOpen, onClose, onTrackOrder }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [isReordering, setIsReordering] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        }
    }, [isOpen]);

    const fetchOrders = async () => {
        const user = authService.getCurrentUser();
        if (!user) return;

        setIsLoading(true);
        const result = await dataService.getUserOrders(Number(user.id));
        if (result.success && result.orders) {
            setOrders(result.orders);
        }
        setIsLoading(false);
    };

    const handleReorder = async (order: any) => {
        const user = authService.getCurrentUser();
        if (!user) {
            alert('Please sign in to reorder.');
            return;
        }

        if (!order.items || order.items.length === 0) {
            alert('This order has no items to reorder.');
            return;
        }

        setIsReordering(order.id);
        try {
            const totalAmount = order.items.reduce(
                (sum: number, item: any) => sum + item.quantity * item.price_per_unit,
                0
            );

            const payload = {
                userId: Number(user.id),
                partnerId: order.partner_id,
                totalAmount,
                items: order.items.map((item: any) => ({
                    id: item.product_id,
                    quantity: item.quantity,
                    price: item.price_per_unit
                }))
            };

            const result = await dataService.placeOrder(payload);
            if (result.success) {
                alert('Your reorder has been placed successfully!');
                await fetchOrders();
            } else {
                alert(result.error || 'Reorder failed. Please try again.');
            }
        } catch (err) {
            alert('Something went wrong while reordering.');
        } finally {
            setIsReordering(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="bg-white w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
                        <p className="text-xs text-gray-500">Track and manage your recent deliveries</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-[#00843D] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-gray-500">Loading your history...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                <ShoppingBag size={40} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
                                <p className="text-sm text-gray-500 max-w-[240px]">Start your first Afta/አፍታ delivery experience today!</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-[#00843D] text-white rounded-full font-bold text-sm hover:shadow-lg transition-all active:scale-95"
                            >
                                Browse Services
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden hover:border-[#00843D]/30 transition-all group"
                                >
                                    <div className="p-4 flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 overflow-hidden flex-shrink-0">
                                            <img src={order.partner_image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591'} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-gray-900 truncate">{order.partner_name}</h4>
                                                <span className="text-sm font-black text-[#00843D]">{order.total_amount} ETB</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}</span>
                                                <span className={`flex items-center gap-1 ${order.status === 'pending' ? 'text-orange-500' : 'text-green-600'}`}>
                                                    {order.status === 'pending' ? <Package size={12} /> : <CheckCircle2 size={12} />}
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onTrackOrder && onTrackOrder(order)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-full border border-blue-400 text-blue-600 bg-white hover:bg-blue-50"
                                                >
                                                    <MapPin size={12} />
                                                    Track
                                                </button>
                                                <button
                                                    onClick={() => handleReorder(order)}
                                                    disabled={isReordering === order.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-full border border-[#00843D]/40 text-[#00843D] bg-white hover:bg-green-50 disabled:opacity-60"
                                                >
                                                    {isReordering === order.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <RefreshCw size={14} />
                                                    )}
                                                    Reorder
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setSelectedOrder(order.id === selectedOrder ? null : order.id)}
                                                className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 group-hover:text-[#00843D] transition-colors"
                                            >
                                                <ChevronRight className={`transition-transform duration-300 ${selectedOrder === order.id ? 'rotate-90' : ''}`} size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Item Details */}
                                    {selectedOrder === order.id && (
                                        <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-white/50 animate-in slide-in-from-top-2 duration-200">
                                            <div className="space-y-3 mt-3">
                                                {order.items?.map((item: any) => (
                                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-800">{item.name}</span>
                                                            <span className="text-[10px] text-gray-500">Qty: {item.quantity} × {item.price_per_unit} ETB</span>
                                                        </div>
                                                        <span className="font-bold text-gray-900">{(item.quantity * item.price_per_unit).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                                <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                                                    <span className="text-xs font-bold text-gray-500">Order ID: #{order.id}</span>
                                                    <button className="text-xs font-bold text-[#00843D] hover:underline">Download Receipt</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Package size={14} className="text-[#00843D]" />
                        <span>Real-time tracking available soon</span>
                    </div>
                    <button className="text-xs font-bold text-blue-600 hover:underline">Help & Support</button>
                </div>
            </div>
        </div>
    );
};

export default MyOrdersModal;
