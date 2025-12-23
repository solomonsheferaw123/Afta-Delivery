import React, { useState, useEffect } from 'react';
import { User, Address } from '../types';
import { X, Camera, Save, Loader2, User as UserIcon, Mail, Phone, Link as LinkIcon, AlertCircle, CheckCircle2, MapPin, Home, Briefcase, Plus, Trash2 } from 'lucide-react';
import { authService } from '../services/authService';

interface ProfileEditorProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'ADDRESSES'>('PERSONAL');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    profile_image_url: ''
  });
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({ label: 'Home', subcity: '', landmark: '' });
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form with user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        profile_image_url: user.profile_image_url || ''
      });
      setAddresses(user.addresses || []);
      setError('');
      setSuccess('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Combine formData and addresses
      const updates = {
        ...formData,
        addresses: addresses
      };

      const result = await authService.updateProfile(user.id, updates);
      if (result.success && result.user) {
        setSuccess('Profile updated successfully!');
        onUpdate(result.user);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.subcity || !newAddress.landmark) {
      setError("Please fill in Subcity and Landmark");
      return;
    }
    const address: Address = {
      id: Date.now().toString(),
      label: newAddress.label || 'Home',
      subcity: newAddress.subcity,
      landmark: newAddress.landmark,
      is_default: addresses.length === 0
    };
    setAddresses([...addresses, address]);
    setNewAddress({ label: 'Home', subcity: '', landmark: '' });
    setIsAddingAddress(false);
    setError('');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center sticky top-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
            <p className="text-xs text-gray-500">Manage your personal info and addresses</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 bg-white p-1.5 rounded-full border border-gray-200 hover:border-gray-300 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('PERSONAL')}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'PERSONAL' ? 'border-[#00843D] text-[#00843D] bg-green-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Personal Info
          </button>
          <button 
            onClick={() => setActiveTab('ADDRESSES')}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'ADDRESSES' ? 'border-[#00843D] text-[#00843D] bg-green-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            My Addresses
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {activeTab === 'PERSONAL' && (
              <div className="space-y-5 animate-in slide-in-from-left-5 duration-200">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <img 
                      src={formData.profile_image_url || "https://i.pravatar.cc/150"} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://i.pravatar.cc/150?u=error";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Enter an image URL below to update</p>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="url" 
                        value={formData.profile_image_url}
                        onChange={(e) => setFormData({...formData, profile_image_url: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-[#00843D] focus:border-[#00843D] outline-none text-sm transition-all bg-gray-50 focus:bg-white"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="text" 
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-[#00843D] focus:border-[#00843D] outline-none text-sm transition-all bg-gray-50 focus:bg-white"
                        placeholder="e.g. Abebe Bikila"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-[#00843D] focus:border-[#00843D] outline-none text-sm transition-all bg-gray-50 focus:bg-white"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="tel" 
                        required
                        value={formData.phone_number}
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-[#00843D] focus:border-[#00843D] outline-none text-sm transition-all bg-gray-50 focus:bg-white"
                        placeholder="+251 9XX XXX XXX"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ADDRESSES' && (
              <div className="space-y-4 animate-in slide-in-from-right-5 duration-200">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-700 flex gap-2">
                   <MapPin size={16} className="flex-shrink-0" />
                   We use landmarks for better delivery accuracy in Addis Ababa.
                </div>

                {addresses.length === 0 && !isAddingAddress && (
                   <div className="text-center py-8 text-gray-500">
                      <MapPin size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No addresses saved yet.</p>
                      <button 
                        type="button"
                        onClick={() => setIsAddingAddress(true)}
                        className="mt-4 text-[#00843D] font-bold text-sm hover:underline"
                      >
                        + Add New Address
                      </button>
                   </div>
                )}

                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="border border-gray-200 rounded-xl p-3 flex justify-between items-start hover:border-[#00843D] transition-colors bg-white shadow-sm">
                       <div className="flex gap-3">
                          <div className="bg-gray-100 p-2 rounded-full h-fit">
                             {addr.label === 'Home' ? <Home size={16} className="text-gray-600" /> : <Briefcase size={16} className="text-gray-600" />}
                          </div>
                          <div>
                             <p className="font-bold text-gray-900 text-sm">{addr.label}</p>
                             <p className="text-xs text-gray-600 font-medium">{addr.subcity}, {addr.landmark}</p>
                          </div>
                       </div>
                       <button 
                         type="button" 
                         onClick={() => handleDeleteAddress(addr.id)}
                         className="text-gray-400 hover:text-red-500 p-1"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  ))}
                </div>

                {isAddingAddress ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                     <h4 className="font-bold text-sm text-gray-900">New Address</h4>
                     <div className="flex gap-2">
                        {['Home', 'Work', 'Other'].map(label => (
                           <button 
                             type="button"
                             key={label}
                             onClick={() => setNewAddress({...newAddress, label})}
                             className={`px-3 py-1.5 rounded-full text-xs font-bold border ${newAddress.label === label ? 'bg-[#00843D] text-white border-[#00843D]' : 'bg-white text-gray-600 border-gray-300'}`}
                           >
                             {label}
                           </button>
                        ))}
                     </div>
                     <input 
                       type="text" 
                       placeholder="Subcity (e.g., Bole, Yeka)" 
                       className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-[#00843D] focus:border-[#00843D] outline-none"
                       value={newAddress.subcity}
                       onChange={(e) => setNewAddress({...newAddress, subcity: e.target.value})}
                     />
                     <input 
                       type="text" 
                       placeholder="Nearby Landmark (e.g., Near Edna Mall)" 
                       className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-[#00843D] focus:border-[#00843D] outline-none"
                       value={newAddress.landmark}
                       onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}
                     />
                     <div className="flex gap-2 mt-2">
                        <button 
                          type="button"
                          onClick={() => setIsAddingAddress(false)}
                          className="flex-1 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button"
                          onClick={handleAddAddress}
                          className="flex-1 py-2 text-xs font-bold text-white bg-[#00843D] rounded-lg"
                        >
                          Add Address
                        </button>
                     </div>
                  </div>
                ) : (
                   addresses.length > 0 && (
                    <button 
                      type="button"
                      onClick={() => setIsAddingAddress(true)}
                      className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-bold flex items-center justify-center gap-2 hover:border-[#00843D] hover:text-[#00843D] transition-all"
                    >
                      <Plus size={16} /> Add Another Address
                    </button>
                   )
                )}
              </div>
            )}

            {/* Status Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 flex gap-3 border-t border-gray-100 mt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 py-2.5 bg-[#00843D] text-white font-bold rounded-lg hover:bg-[#006B31] shadow-lg shadow-green-900/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;