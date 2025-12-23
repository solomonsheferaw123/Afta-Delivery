import React, { useState, useEffect } from 'react';
import { X, Search, Plus, ShoppingBag, Star, Filter, Loader2, CheckCircle2 } from 'lucide-react';
import { IMAGES } from '../imageRegistry';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';

interface MarketplaceModalProps {
   isOpen: boolean;
   onClose: () => void;
   initialTab?: 'FOOD' | 'MART';
   initialCategory?: string;
   onAddToCart: (count: number) => void;
   onOrderSuccess?: (updatedUser: any) => void;
}

const MarketplaceModal: React.FC<MarketplaceModalProps> = ({ isOpen, onClose, initialTab = 'FOOD', initialCategory = 'ALL', onAddToCart, onOrderSuccess }) => {
   const [activeTab, setActiveTab] = useState(initialTab);
   const [activeCategory, setActiveCategory] = useState(initialCategory);
   const [searchQuery, setSearchQuery] = useState('');
   const [items, setItems] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [orderStatus, setOrderStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'>('IDLE');

   // Cart State
   const [cart, setCart] = useState<any[]>([]);
   const [isCartOpen, setIsCartOpen] = useState(false);

   useEffect(() => {
      if (isOpen) {
         setActiveTab(initialTab);
         setActiveCategory(initialCategory);
         fetchItems(initialTab as 'FOOD' | 'MART', initialCategory);
      }
   }, [isOpen, initialTab, initialCategory]);

   const fetchItems = async (tab: 'FOOD' | 'MART', cat: string) => {
      setIsLoading(true);
      const categoryFilter = tab === 'FOOD' ? 'FOOD' : (cat === 'ALL' ? undefined : cat);
      const data = await dataService.getProducts(undefined, categoryFilter);
      setItems(data);
      setIsLoading(false);
   };

   const addToCart = (item: any) => {
      setCart(prev => {
         const existing = prev.find(i => i.id === item.id);
         if (existing) {
            return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
         }
         return [...prev, { ...item, quantity: 1 }];
      });
      onAddToCart(1);
   };

   const updateQuantity = (id: number, delta: number) => {
      setCart(prev => {
         return prev.map(item => {
            if (item.id === id) {
               const newQty = Math.max(1, item.quantity + delta);
               return { ...item, quantity: newQty };
            }
            return item;
         });
      });
   };

   const removeFromCart = (id: number) => {
      setCart(prev => prev.filter(item => item.id !== id));
   };

   const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

   const handleCheckout = async () => {
      const user = authService.getCurrentUser();
      if (!user) {
         alert("Please login to place an order.");
         return;
      }

      if (cart.length === 0) return;

      setOrderStatus('PENDING');

      // Group items by partner (simplified for now: assume single partner or first partner)
      const partnerId = cart[0].partner_id;

      const result = await dataService.placeOrder({
         userId: Number(user.id),
         partnerId: partnerId,
         totalAmount: cartTotal,
         items: cart
      });

      if (result.success) {
         setOrderStatus('SUCCESS');
         setCart([]);
         if (result.user && onOrderSuccess) {
            onOrderSuccess(result.user);
         }
         setTimeout(() => {
            setOrderStatus('IDLE');
            onClose();
         }, 2000);
      } else {
         setOrderStatus('ERROR');
         alert(result.error || "Order failed");
         setOrderStatus('IDLE');
      }
   };

   if (!isOpen) return null;

   const filteredItems = items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
   );

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
         <div className="bg-gray-50 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 flex flex-col lg:flex-row">

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
               {/* Header */}
               <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-20">
                  <div className="flex gap-4 items-center">
                     <h2 className="text-xl font-bold text-gray-900">
                        {activeTab === 'FOOD' ? '🍽️ Afta/አፍታ Food' : '🛒 Afta/አፍታ Mart'}
                     </h2>
                     <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                           onClick={() => { setActiveTab('FOOD'); setActiveCategory('ALL'); fetchItems('FOOD', 'ALL'); }}
                           className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'FOOD' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                           Restaurants
                        </button>
                        <button
                           onClick={() => { setActiveTab('MART'); setActiveCategory('ALL'); fetchItems('MART', 'ALL'); }}
                           className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'MART' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                           Grocery
                        </button>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button
                        onClick={() => setIsCartOpen(!isCartOpen)}
                        className="lg:hidden p-2 bg-gray-100 rounded-full text-gray-700 relative"
                     >
                        <ShoppingBag size={24} />
                        {cart.length > 0 && <span className="absolute top-0 right-0 bg-[#DA121A] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>}
                     </button>
                     <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={24} /></button>
                  </div>
               </div>

               {/* Search & Filter */}
               <div className="px-6 py-4 bg-white shadow-sm z-10">
                  <div className="flex gap-3">
                     <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                           type="text"
                           placeholder={`Search ${activeTab === 'FOOD' ? 'dishes & restaurants' : 'groceries & essentials'}...`}
                           className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#00843D] outline-none"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>
                  </div>

                  <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                     {activeTab === 'FOOD' ? (
                        ['🔥 Popular', '🥬 Fasting', '🍔 Burgers', '🍕 Pizza', '☕ Coffee'].map((tag) => (
                           <button key={tag} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 whitespace-nowrap hover:border-[#00843D] hover:text-[#00843D]">
                              {tag}
                           </button>
                        ))
                     ) : (
                        ['ALL', 'GROCERY', 'ELECTRONICS', 'HOME', 'ESSENTIALS'].map((cat) => (
                           <button
                              key={cat}
                              onClick={() => { setActiveCategory(cat); fetchItems('MART', cat); }}
                              className={`px-3 py-1 border rounded-full text-xs font-bold whitespace-nowrap ${activeCategory === cat ? 'bg-purple-100 border-purple-200 text-purple-700' : 'bg-white border-gray-200'}`}
                           >
                              {cat === 'ALL' ? 'View All' : cat}
                           </button>
                        ))
                     )}
                  </div>
               </div>

               {/* Grid Content */}
               <div className="flex-1 overflow-y-auto p-6 relative">
                  {isLoading && (
                     <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-30 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#00843D]" size={40} />
                     </div>
                  )}

                  {orderStatus === 'SUCCESS' && (
                     <div className="absolute inset-0 bg-white/90 z-40 flex flex-col items-center justify-center animate-in fade-in duration-300 text-center px-6">
                        <CheckCircle2 className="text-green-500 mb-4" size={64} />
                        <h3 className="text-2xl font-bold text-gray-900">Order Successful!</h3>
                        <p className="text-gray-500">Your points and cashback have been added to your Afta Pay wallet.</p>
                     </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                     {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group flex flex-col">
                           <div className="h-32 overflow-hidden relative">
                              <img src={item.image_url || IMAGES.product_placeholder} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           </div>
                           <div className="p-3 flex-1 flex flex-col">
                              <h3 className="font-bold text-gray-900 text-sm mb-1">{item.name}</h3>
                              <p className="text-[10px] text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                              <div className="mt-auto flex justify-between items-center">
                                 <span className="font-bold text-[#00843D] text-sm">{item.price} ETB</span>
                                 <button
                                    onClick={() => addToCart(item)}
                                    className="p-2 rounded-lg bg-[#00843D]/10 text-[#00843D] hover:bg-[#00843D] hover:text-white transition-all transform active:scale-90"
                                    title="Add to Cart"
                                 >
                                    <Plus size={16} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Shopping Cart Sidebar (Desktop) / Overlay (Mobile) */}
            <div className={`
               lg:w-80 w-full lg:relative absolute inset-y-0 right-0 bg-white border-l border-gray-200 flex flex-col z-30
               transform transition-transform duration-300 lg:translate-x-0
               ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-2">
                     <ShoppingBag size={20} className="text-[#00843D]" />
                     <h3 className="font-bold text-gray-900">Your Basket</h3>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="lg:hidden text-gray-500"><X size={20} /></button>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {cart.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                        <ShoppingBag size={48} className="mb-2 opacity-20" />
                        <p>Your basket is empty</p>
                     </div>
                  ) : (
                     cart.map(item => (
                        <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 animate-in slide-in-from-right-2">
                           <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-gray-900 truncate">{item.name}</p>
                              <p className="text-[10px] text-gray-500 mb-2">{item.price} ETB</p>
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 px-1">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-500 hover:text-red-500"><X size={10} /></button>
                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-500 hover:text-green-500"><Plus size={10} /></button>
                                 </div>
                                 <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                    <X size={14} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>

               <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                  <div className="space-y-1">
                     <div className="flex justify-between text-xs text-gray-500">
                        <span>Subtotal</span>
                        <span>{cartTotal.toFixed(2)} ETB</span>
                     </div>
                     <div className="flex justify-between text-xs text-gray-500">
                        <span>Delivery Fee</span>
                        <span className="text-green-600 font-bold text-[10px] uppercase">Free</span>
                     </div>
                     <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span>{cartTotal.toFixed(2)} ETB</span>
                     </div>
                  </div>

                  <button
                     disabled={cart.length === 0 || orderStatus === 'PENDING'}
                     onClick={handleCheckout}
                     className="w-full bg-[#00843D] hover:bg-[#006B31] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50 transition-all active:scale-95"
                  >
                     {orderStatus === 'PENDING' ? (
                        <>
                           <Loader2 className="animate-spin" size={18} />
                           Processing...
                        </>
                     ) : (
                        <>
                           Checkout <ShoppingBag size={18} />
                        </>
                     )}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default MarketplaceModal;