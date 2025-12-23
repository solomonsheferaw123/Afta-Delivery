
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, ShoppingBag, DollarSign,
    LogOut, TrendingUp, User, Search, Filter,
    MoreVertical, ArrowUpRight, ArrowDownRight, Loader2, X
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { User as UserType } from '../types';

interface AdminDashboardProps {
    user: UserType;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'PARTNERS'>('OVERVIEW');
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Add Partner State
    const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [partnerForm, setPartnerForm] = useState({
        name: '',
        category: 'Food',
        image_url: '',
        delivery_time: '30-45 min'
    });

    const categories = ['Food', 'Mart', 'Express', 'Drinks', 'Pharmacy'];

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await dataService.addPartner(partnerForm);
            if (res.success) {
                setPartners([res.partner, ...partners]);
                setIsAddPartnerOpen(false);
                setPartnerForm({ name: '', category: 'Food', image_url: '', delivery_time: '30-45 min' });
            } else {
                alert(res.error || 'Failed to add partner');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, usersRes, partnersRes] = await Promise.all([
                dataService.getAdminStats(),
                dataService.getAdminUsers(),
                dataService.getAdminPartners()
            ]);

            if (statsRes.success) setStats(statsRes);
            if (usersRes.success) setUsers(usersRes.users || []);
            if (partnersRes.success) setPartners(partnersRes.partners || []);
        } catch (error) {
            console.error("Admin Load Error", error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderOverview = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <Users size={24} />
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <TrendingUp size={12} className="mr-1" /> +12%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stats?.stats?.totalUsers?.toLocaleString() || '-'}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                            <ShoppingBag size={24} />
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <TrendingUp size={12} className="mr-1" /> +8%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stats?.stats?.totalOrders?.toLocaleString() || '-'}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-green-50 p-3 rounded-xl text-green-600">
                            <DollarSign size={24} />
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <TrendingUp size={12} className="mr-1" /> +24%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stats?.stats?.totalRevenue?.toLocaleString() || '0'} <span className="text-sm text-gray-400 font-normal">ETB</span></p>
                </div>
            </div>

            {/* Recent Signups */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Recent Signups</h3>
                    <button className="text-sm text-blue-600 font-bold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">User</th>
                                <th className="px-6 py-4 font-bold">Role</th>
                                <th className="px-6 py-4 font-bold">Joined</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stats?.recentUsers?.map((u: any) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                                                {u.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{u.full_name}</p>
                                                <p className="text-xs text-gray-500">{u.email || u.phone_number}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${u.user_type === 'admin' ? 'bg-purple-100 text-purple-600' :
                                            u.user_type === 'restaurant' ? 'bg-orange-100 text-orange-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                            {u.user_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-xs font-medium text-gray-600">Active</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900">User Management</h3>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00843D]/20 focus:border-[#00843D]"
                        />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500">
                        <Filter size={18} />
                    </button>
                    <button className="bg-[#00843D] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#006B31] transition-colors">
                        <User size={16} /> Add User
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-bold">ID</th>
                            <th className="px-6 py-4 font-bold">User</th>
                            <th className="px-6 py-4 font-bold">Contact</th>
                            <th className="px-6 py-4 font-bold">Role</th>
                            <th className="px-6 py-4 font-bold">Wallet</th>
                            <th className="px-6 py-4 font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-500">#{u.id}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center text-xs font-bold">
                                            {u.full_name?.charAt(0)}
                                        </div>
                                        <span className="font-bold text-gray-900">{u.full_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex flex-col">
                                        <span>{u.phone_number}</span>
                                        <span className="text-xs text-gray-400">{u.username}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${u.user_type === 'admin' ? 'bg-purple-100 text-purple-600' :
                                        u.user_type === 'restaurant' ? 'bg-orange-100 text-orange-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                        {u.user_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {u.wallet_balance?.toLocaleString()} ETB
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPartners = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900">Partner Management</h3>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search partners..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00843D]/20 focus:border-[#00843D]"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddPartnerOpen(true)}
                        className="bg-[#00843D] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#006B31] transition-colors"
                    >
                        <ShoppingBag size={16} /> Add Partner
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-bold">ID</th>
                            <th className="px-6 py-4 font-bold">Partner</th>
                            <th className="px-6 py-4 font-bold">Category</th>
                            <th className="px-6 py-4 font-bold">Rating</th>
                            <th className="px-6 py-4 font-bold">Orders</th>
                            <th className="px-6 py-4 font-bold">Revenue</th>
                            <th className="px-6 py-4 font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {partners.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-500">#{p.id}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden">
                                            <img src={p.image_url || 'https://via.placeholder.com/40'} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <span className="font-bold text-gray-900">{p.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase">
                                        {p.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-orange-400 font-bold">
                                        <span className="text-gray-900">{p.rating}</span>
                                        <span className="text-xs">★</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-700">
                                    {p.order_count}
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {Number(p.total_revenue).toLocaleString()} ETB
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#00843D] rounded-lg flex items-center justify-center text-white">
                        <LayoutDashboard size={18} />
                    </div>
                    <span className="font-black text-xl tracking-tight text-gray-900">Afta<span className="text-[#DA121A]">Admin</span></span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('OVERVIEW')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'OVERVIEW' ? 'bg-[#00843D] text-white shadow-lg shadow-green-500/20' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <LayoutDashboard size={20} /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('USERS')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'USERS' ? 'bg-[#00843D] text-white shadow-lg shadow-green-500/20' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Users size={20} /> Users & Roles
                    </button>
                    <button
                        onClick={() => setActiveTab('PARTNERS')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'PARTNERS' ? 'bg-[#00843D] text-white shadow-lg shadow-green-500/20' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <ShoppingBag size={20} /> Partners
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <img src={user.profile_image_url || "https://i.pravatar.cc/150"} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.full_name}</p>
                            <p className="text-xs text-green-600 font-bold">Super Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-gray-800">
                        {activeTab === 'OVERVIEW' && 'Dashboard Overview'}
                        {activeTab === 'USERS' && 'User Management'}
                        {activeTab === 'PARTNERS' && 'Partner Management'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-gray-500 font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                    {isLoading ? (
                        <div className="h-96 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="animate-spin mb-4 text-[#00843D]" size={48} />
                            <p className="font-bold animate-pulse text-sm">Loading Data...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'OVERVIEW' && renderOverview()}
                            {activeTab === 'USERS' && renderUsers()}
                            {activeTab === 'PARTNERS' && renderPartners()}
                        </>
                    )}
                </div>
            </main>

            {/* Add Partner Modal */}
            {isAddPartnerOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-900">Add New Partner</h2>
                            <button onClick={() => setIsAddPartnerOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddPartner} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Partner Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00843D]/20"
                                    placeholder="e.g. Burger King"
                                    value={partnerForm.name}
                                    onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00843D]/20"
                                        value={partnerForm.category}
                                        onChange={(e) => setPartnerForm({ ...partnerForm, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delivery Time</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00843D]/20"
                                        placeholder="e.g. 30-45 min"
                                        value={partnerForm.delivery_time}
                                        onChange={(e) => setPartnerForm({ ...partnerForm, delivery_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00843D]/20"
                                    placeholder="https://..."
                                    value={partnerForm.image_url}
                                    onChange={(e) => setPartnerForm({ ...partnerForm, image_url: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#00843D] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#006B31] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {isSubmitting ? 'Adding...' : 'Add Partner'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
