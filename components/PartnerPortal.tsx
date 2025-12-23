
import React, { useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, Utensils, DollarSign, Settings, LogOut,
  Bell, CheckCircle2, Clock, XCircle, Plus, Edit2, TrendingUp, Star, Filter,
  ChevronRight, ArrowUpRight
} from 'lucide-react';
import { User, RestaurantOrder, MenuItem, PartnerReview } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dataService } from '../services/dataService';
import { Loader2, X } from 'lucide-react';
import { IMAGES } from '../imageRegistry';

interface PartnerPortalProps {
  user: User;
  onLogout: () => void;
}

const PartnerPortal: React.FC<PartnerPortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ORDERS' | 'MENU' | 'EARNINGS'>('DASHBOARD');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newItem, setNewItem] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    category: 'Main',
    image_url: '',
    image_preview: '',
    is_available: true
  });

  const [isEditing, setIsEditing] = useState(false);

  const [orders, setOrders] = useState<RestaurantOrder[]>([]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  React.useEffect(() => {
    fetchMenuItems();
    fetchOrders();

    const interval = setInterval(fetchOrders, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchMenuItems = async () => {
    // Assuming user.id corresponds to partner_id for this demo session
    const data = await dataService.getProducts(user.id);
    setMenuItems(data);
  };

  const fetchOrders = async () => {
    // Determine Partner ID (If the logged in user is a partner, we use their ID. 
    // In a real app, User -> Partner relation might be different, but for now assuming User.ID = Partner.ID for simplicity or stored in user object)
    // Note: The backend expects 'partnerId'. Since our schema links orders to 'partner_id', and our Auth system might not fully link User -> Partner table perfectly yet,
    // we will assume the user.id IS the partner_id for this demo.
    const res = await dataService.getPartnerOrders(Number(user.id));
    if (res.success && res.orders) {
      // Parse dates
      const parsedOrders = res.orders.map((o: any) => ({
        ...o,
        created_at: new Date(o.created_at)
      }));
      setOrders(parsedOrders);
    }
  };

  const earningsData = [
    { day: 'Mon', amount: 4500 },
    { day: 'Tue', amount: 3200 },
    { day: 'Wed', amount: 5100 },
    { day: 'Thu', amount: 4800 },
    { day: 'Fri', amount: 8500 },
    { day: 'Sat', amount: 9200 },
    { day: 'Sun', amount: 7800 },
  ];

  // --- ACTIONS ---

  const updateOrderStatus = async (id: string, newStatus: RestaurantOrder['status']) => {
    // Optimistic update
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));

    const res = await dataService.updateOrderStatus(id, newStatus);
    if (!res.success) {
      // Revert on failure
      alert('Failed to update order status');
      fetchOrders();
    }
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    const updatedStatus = !item.is_available;
    try {
      const result = await dataService.updateProduct(item.id, {
        ...item,
        is_available: updatedStatus
      });
      if (result.success) {
        setMenuItems(menuItems.map(m => m.id === item.id ? { ...m, is_available: updatedStatus } : m));
      }
    } catch (error) {
      console.error("Failed to toggle availability:", error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const result = await dataService.deleteProduct(id);
      if (result.success) {
        setMenuItems(menuItems.filter(m => m.id !== id));
      } else {
        alert(result.error || "Failed to delete item");
      }
    } catch (error) {
      alert("An error occurred during deletion");
    }
  };

  const openEditModal = (item: MenuItem) => {
    setNewItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url,
      image_preview: item.image_url,
      is_available: item.is_available
    });
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        // Update logic
        const result = await dataService.updateProduct(newItem.id, {
          name: newItem.name,
          description: newItem.description,
          price: Number(newItem.price),
          category: newItem.category,
          image_url: newItem.image_url,
          is_available: newItem.is_available
        });

        if (result.success) {
          setMenuItems(menuItems.map(m => m.id === newItem.id ? {
            ...m,
            name: newItem.name,
            description: newItem.description,
            price: Number(newItem.price),
            category: newItem.category,
            image_url: newItem.image_url
          } : m));
          setIsAddModalOpen(false);
          resetForm();
        } else {
          alert(result.error || "Failed to update item");
        }
      } else {
        // Add logic (already implemented previously, but re-integrated here)
        const result = await dataService.addProduct({
          partnerId: Number(user.id),
          name: newItem.name,
          description: newItem.description,
          price: Number(newItem.price),
          category: newItem.category,
          image_url: newItem.image_url || IMAGES.product_placeholder
        });

        if (result.success) {
          setMenuItems([result.product, ...menuItems]);
          setIsAddModalOpen(false);
          resetForm();
        } else {
          alert(result.error || "Failed to add item");
        }
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewItem({ id: '', name: '', description: '', price: '', category: 'Main', image_url: '', image_preview: '', is_available: true });
    setIsEditing(false);
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

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-green-50 p-2 rounded-lg text-green-600"><DollarSign size={20} /></div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">+12%</span>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold">Today's Revenue</p>
          <h3 className="text-2xl font-bold text-gray-900">4,250 ETB</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><ShoppingBag size={20} /></div>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">New</span>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold">Active Orders</p>
          <h3 className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status !== 'DELIVERED').length}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><Utensils size={20} /></div>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold">Menu Items</p>
          <h3 className="text-2xl font-bold text-gray-900">{menuItems.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600"><Star size={20} /></div>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold">Rating</p>
          <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {orders.slice(0, 3).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-10 rounded-full ${order.status === 'PENDING' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                  <div>
                    <p className="font-bold text-sm">{order.id} - {order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.items.length} items • {order.total_amount} ETB</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-white rounded border border-gray-200">{order.status}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab('ORDERS')} className="w-full mt-4 text-center text-sm text-[#00843D] font-bold hover:underline">View All Orders</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4">Weekly Revenue</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="amount" fill="#00843D" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-800">Live Orders</h3>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 bg-white border border-gray-200 rounded-full text-orange-600">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div> Pending: {orders.filter(o => o.status === 'PENDING').length}
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {orders.map((order) => (
          <div key={order.id} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-xl font-bold text-gray-900">{order.id}</h4>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                  order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'READY' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {order.status}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> {order.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-sm font-bold text-gray-700 mb-1">{order.customer_name}</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-bold text-gray-900">{item.quantity}x</span> {item.name}
                  </li>
                ))}
              </ul>
              {order.note && <p className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100">Note: {order.note}</p>}
            </div>

            <div className="flex flex-row md:flex-col gap-2 items-end min-w-[140px]">
              <div className="text-xl font-bold text-[#00843D] mb-2">{order.total_amount} ETB</div>

              {order.status === 'PENDING' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                  className="w-full py-2 bg-[#00843D] text-white rounded-lg font-bold text-sm hover:bg-[#006B31] flex items-center justify-center gap-2"
                >
                  Accept <CheckCircle2 size={16} />
                </button>
              )}

              {order.status === 'PREPARING' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'READY')}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  Mark Ready <CheckCircle2 size={16} />
                </button>
              )}

              {order.status === 'READY' && (
                <div className="w-full py-2 bg-gray-100 text-gray-500 rounded-lg font-bold text-sm text-center">
                  Waiting for Courier
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-800">Menu Management</h3>
        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00843D] text-white rounded-lg font-bold text-sm hover:bg-[#006B31]"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Loading your menu...</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="col-span-full py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
            <Utensils size={48} className="mb-4 opacity-20" />
            <p className="font-bold">No menu items found</p>
            <p className="text-sm">Click "Add Item" to start your menu</p>
          </div>
        ) : (
          menuItems.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-100 relative">
                <img src={item.image_url} alt={item.name} className={`w-full h-full object-cover ${!item.is_available ? 'grayscale opacity-50' : ''}`} />
                {!item.is_available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">UNAVAILABLE</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <span className="text-sm font-bold text-[#00843D]">{item.price} Br</span>
                </div>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{item.description}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 py-1.5 border border-gray-200 rounded text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => toggleItemAvailability(item)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold text-white flex items-center justify-center gap-1 ${item.is_available ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {item.is_available ? 'Disable' : 'Enable'}
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="w-full mt-2 py-1 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider"
                >
                  Delete Item
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 md:h-screen sticky top-0 z-30 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[#00843D] mb-1">
            <Utensils size={24} />
            <span className="font-black text-xl tracking-tight">Afta/አፍታ Partner</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Restaurant Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'ORDERS', label: 'Orders', icon: ShoppingBag, badge: orders.filter(o => o.status === 'PENDING').length },
            { id: 'MENU', label: 'Menu', icon: Utensils },
            { id: 'EARNINGS', label: 'Earnings', icon: TrendingUp },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                ? 'bg-[#00843D] text-white shadow-md shadow-green-900/10'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </div>
              {item.badge ? (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user.profile_image_url} alt="Profile" className="w-10 h-10 rounded-full border border-gray-200" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{user.phone_number}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'DASHBOARD' && 'Dashboard'}
              {activeTab === 'ORDERS' && 'Order Management'}
              {activeTab === 'MENU' && 'Menu Editor'}
              {activeTab === 'EARNINGS' && 'Financial Reports'}
            </h1>
            <p className="text-sm text-gray-500">Welcome back, {user.full_name}</p>
          </div>
          <button className="p-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-[#00843D] relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {activeTab === 'DASHBOARD' && renderDashboard()}
        {activeTab === 'ORDERS' && renderOrders()}
        {activeTab === 'MENU' && renderMenu()}
        {activeTab === 'EARNINGS' && (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
            <DollarSign size={48} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Detailed Financial Reports</h2>
            <p className="text-gray-500 mb-6">Download your monthly statements and tax reports.</p>
            <button className="bg-[#00843D] text-white px-6 py-2 rounded-lg font-bold">Download CSV</button>
          </div>
        )}
      </main>
      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-xl">{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00843D] outline-none"
                  placeholder="e.g. Special Kitfo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00843D] outline-none"
                    placeholder="450"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00843D] outline-none"
                  >
                    <option value="Main">Main Course</option>
                    <option value="Appetizers">Appetizers</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00843D] outline-none h-24 resize-none"
                  placeholder="Describe your dish..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    {newItem.image_preview ? (
                      <img src={newItem.image_preview} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <Plus className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors inline-block">
                      Choose File
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                    <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#00843D] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#006B31] shadow-lg shadow-green-900/10 disabled:opacity-50 mt-4"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Save Product')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerPortal;
