
import React, { useState, useEffect } from 'react';
import { Menu, X, Truck, Globe, User as UserIcon, Lock, Loader2, ShoppingBag, Wallet, ChevronDown, LogOut, Phone, HelpCircle, Briefcase, Bike, ArrowRight, Search, MapPin, Star, Filter, History, Heart, ChevronUp, Smartphone, Home, Package, Utensils, Store, Eye, EyeOff, Mail, CheckCircle2 } from 'lucide-react';
import WalletWidget from './WalletWidget';
import ProfileEditor from './ProfileEditor';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { User } from '../types';


interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  onOpenFood?: () => void;
  onOpenMart?: (category?: string) => void;
  onOpenBusiness?: () => void;
  onOpenPartners?: () => void;
  onOpenPartnerLogin?: () => void; // New Prop
  onOpenTracking?: () => void;
  onOpenOrders?: () => void;
  onSwitchToApp?: () => void;
}


const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onCartClick,
  onLoginClick,
  onOpenFood,
  onOpenMart,
  onOpenBusiness,
  onOpenPartners,
  onOpenPartnerLogin,
  onOpenTracking,
  onOpenOrders,
  onSwitchToApp
}) => {

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [lang, setLang] = useState<'EN' | 'AM'>('EN');

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'SIGNIN' | 'SIGNUP'>('SIGNIN');
  const [isLoading, setIsLoading] = useState(false);

  // Login/Signup Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPartnerSignup, setIsPartnerSignup] = useState(false);

  const [error, setError] = useState('');

  // Dropdown States (Desktop)
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFoodMenuOpen, setIsFoodMenuOpen] = useState(false);
  const [isMartMenuOpen, setIsMartMenuOpen] = useState(false);
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(false);
  const [isPartnerMenuOpen, setIsPartnerMenuOpen] = useState(false);

  // Accordion States (Mobile)
  const [mobileFoodOpen, setMobileFoodOpen] = useState(false);
  const [mobileMartOpen, setMobileMartOpen] = useState(false);
  const [mobileBusinessOpen, setMobileBusinessOpen] = useState(false);
  const [mobilePartnersOpen, setMobilePartnersOpen] = useState(false);

  // Initialize Auth
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Translations
  const content = {
    EN: {
      home: 'Food',
      mart: 'Mart',
      business: 'Business',
      partners: 'Partners',
      restaurants: 'For Restaurants',
      couriers: 'For Couriers',
      help: 'Help',
      signIn: 'Sign In',
      signUp: 'Create Account',
      signinTitle: 'Welcome Back!',
      signinDesc: 'Sign in to your account',
      signupTitle: 'Create Your Account',
      signupDesc: 'Join Afta/አፍታ and start ordering!',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm Password',
      emailLabel: 'Email (Optional)',
      phoneLabel: 'Phone Number',
      nameLabel: 'Full Name',
      signinBtn: 'Sign In',
      signupBtn: 'Create Account',
      myAccount: 'Edit Profile',
      logout: 'Log Out',
      orders: 'My Orders',
      switchToSignup: 'Don\'t have an account?',
      switchToSignin: 'Already have an account?',
      signupLink: 'Sign Up',
      signinLink: 'Sign In'
    },
    AM: {
      home: 'ምግብ',
      mart: 'ገበያ',
      business: 'ለንግድ',
      partners: 'አጋሮች',
      restaurants: 'ለሬስቶራንቶች',
      couriers: 'ለተላላኪዎች',
      help: 'እርዳታ',
      signIn: 'ይግቡ',
      signUp: 'ይመዝገቡ',
      signinTitle: 'እንኳን ደህና መጡ!',
      signinDesc: 'ወደ መለያዎ ይግቡ',
      signupTitle: 'መለያ ይፍጠሩ',
      signupDesc: 'Afta/አፍታ ይቀላቀሉ እና ማዘዝ ይጀምሩ!',
      usernameLabel: 'የተጠቃሚ ስም',
      passwordLabel: 'የይለፍ ቃል',
      confirmPasswordLabel: 'የይለፍ ቃል ያረጋግጡ',
      emailLabel: 'ኢሜይል (አማራጭ)',
      phoneLabel: 'ስልክ ቁጥር',
      nameLabel: 'ሙሉ ስም',
      signinBtn: 'ግባ',
      signupBtn: 'መዝገብ',
      myAccount: 'መለያ ያርትዑ',
      logout: 'ውጣ',
      orders: 'የእኔ ትዕዛዞች',
      switchToSignup: 'መለያ የለዎትም?',
      switchToSignin: 'መለያ አለዎት?',
      signupLink: 'ይመዝገቡ',
      signinLink: 'ይግቡ'
    }
  };

  const t = content[lang];

  const handleNavigation = (href: string, action?: () => void) => {
    setIsOpen(false);
    setIsPartnerMenuOpen(false);
    setIsFoodMenuOpen(false);
    setIsMartMenuOpen(false);
    setIsBusinessMenuOpen(false);

    if (action) {
      action();
    } else if (href.startsWith('#')) {
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const toggleLang = () => {
    setLang(lang === 'EN' ? 'AM' : 'EN');
  };

  // Auth Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'SIGNIN') {
      // Sign In validation
      if (!username || !password) {
        setError('Username and password are required');
        return;
      }

      setIsLoading(true);
      try {
        const result = await authService.login(username, password);
        if (result.success && result.user) {
          setUser(result.user);
          setIsLoginOpen(false);
          resetForm();
        } else {
          setError(result.error || 'Login failed');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign Up validation
      if (!username || !password || !fullName || !phone) {
        setError('All required fields must be filled');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsLoading(true);
      try {
        const result = await authService.signup(username, password, fullName, email, phone, isPartnerSignup ? 'restaurant' : 'customer');
        if (result.success && result.user) {
          setUser(result.user);
          setIsLoginOpen(false);
          resetForm();
        } else {
          setError(result.error || 'Signup failed');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsUserMenuOpen(false);
    setIsOpen(false);
  };

  const resetAuthForm = () => {
    setIsLoginOpen(false);
    setAuthMode('SIGNIN');
    resetForm();
  };

  const resetForm = () => {
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setEmail('');
    setPhone('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'SIGNIN' ? 'SIGNUP' : 'SIGNIN');
    setError('');
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Handle Chapa Success Redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const txRef = urlParams.get('tx_ref');
    const status = urlParams.get('payment_status');

    if (status === 'success' && txRef) {
      handleVerifyPayment(txRef);
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const handleVerifyPayment = async (txRef: string) => {
    try {
      const result = await dataService.verifyChapaPayment(txRef);
      if (result.success && result.user) {
        setUser(result.user);
        authService.saveUser(result.user); // Persist updated balance
        alert('✅ Payment successful! Your wallet has been updated.');
      }
    } catch (err) {
      console.error("Payment verification failed", err);
    }
  };


  // --- MENU CONFIGURATIONS ---

  const foodMenuItems = [
    { label: 'Restaurant Discovery', icon: Search, action: onOpenFood },
    { label: 'Ordering & Checkout', icon: ShoppingBag, action: onOpenFood },
    { label: 'Live Order Tracking', icon: MapPin, action: onOpenTracking },
    { label: 'Ratings & Reviews', icon: Star, action: onOpenFood },
    { label: 'Filtering Options', icon: Filter, action: onOpenFood },
    { label: 'Order History', icon: History, action: onOpenOrders },
    { label: 'Favorite Restaurants', icon: Heart, action: onOpenFood },
  ];


  const martMenuItems = [
    { label: 'Shop Groceries', icon: ShoppingBag, action: () => onOpenMart && onOpenMart('GROCERY') },
    { label: 'Electronics', icon: Smartphone, action: () => onOpenMart && onOpenMart('ELECTRONICS') },
    { label: 'Home & Living', icon: Home, action: () => onOpenMart && onOpenMart('HOME') },
    { label: 'Daily Essentials', icon: Package, action: () => onOpenMart && onOpenMart('ESSENTIALS') },
  ];

  const businessMenuItems = [
    { label: 'Corporate Lunch Plans', icon: Utensils, action: onOpenBusiness },
    { label: 'Afta/አፍታ Express Logistics', icon: Truck, action: onOpenBusiness },
    { label: 'Bulk Ordering', icon: Package, action: onOpenBusiness },
  ];

  const partnerMenuItems = [
    { label: 'For Restaurants', icon: Store, action: onOpenPartnerLogin }, // Updated Action
    { label: 'For Couriers', icon: Bike, action: onOpenPartners },
    { label: 'For Suppliers', icon: Briefcase, action: onOpenPartners },
  ];

  // Helper to render dropdown list
  const renderDropdown = (items: any[], closeMenu: () => void) => (
    <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-40 animate-in fade-in slide-in-from-top-2">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            closeMenu();
            if (item.action) item.action();
          }}
          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00843D] flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
        >
          <item.icon size={16} className="text-gray-400 group-hover:text-[#00843D]" />
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'glass py-2' : 'bg-transparent py-4'}`}>
        {/* Ethiopian Accent Border */}
        <div className="flex h-1.5 w-full">
          <div className="w-1/3 bg-[#00843D]"></div>
          <div className="w-1/3 bg-[#FCDD09]"></div>
          <div className="w-1/3 bg-[#DA121A]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">

            {/* BRAND LOGO */}
            <div
              className="flex-shrink-0 flex items-center cursor-pointer group gap-2"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="bg-gradient-to-br from-[#00843D] to-[#006B31] p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-baseline leading-none">

                  {/* Split Color Branding: Red for English, Green for Amharic */}
                  <span className="font-black text-2xl tracking-tight">
                    <span className="text-[#DA121A]">Afta</span>
                    <span className="text-gray-300 mx-0.5 font-light">/</span>
                    <span className="text-[#00843D]">አፍታ</span>
                  </span>
                </div>
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.25em] text-right">Delivery</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex space-x-6 items-center">

              {/* Food Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setIsFoodMenuOpen(true)}
                onMouseLeave={() => setIsFoodMenuOpen(false)}
              >
                <button
                  className="text-gray-600 hover:text-[#00843D] font-medium transition-colors text-sm flex items-center gap-1 py-2"
                  onClick={() => handleNavigation('#ecosystem', onOpenFood)}
                >
                  {t.home} <ChevronDown size={14} className={`transition-transform duration-200 ${isFoodMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFoodMenuOpen && renderDropdown(foodMenuItems, () => setIsFoodMenuOpen(false))}
              </div>

              {/* Mart Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setIsMartMenuOpen(true)}
                onMouseLeave={() => setIsMartMenuOpen(false)}
              >
                <button
                  className="text-gray-600 hover:text-[#00843D] font-medium transition-colors text-sm flex items-center gap-1 py-2"
                  onClick={() => handleNavigation('#mart', () => onOpenMart && onOpenMart('ALL'))}
                >
                  <ShoppingBag size={14} className="mb-0.5" /> {t.mart} <ChevronDown size={14} className={`transition-transform duration-200 ${isMartMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMartMenuOpen && renderDropdown(martMenuItems, () => setIsMartMenuOpen(false))}
              </div>

              {/* Business Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setIsBusinessMenuOpen(true)}
                onMouseLeave={() => setIsBusinessMenuOpen(false)}
              >
                <button
                  className="text-gray-600 hover:text-[#00843D] font-medium transition-colors text-sm flex items-center gap-1 py-2"
                  onClick={() => handleNavigation('#business', onOpenBusiness)}
                >
                  {t.business} <ChevronDown size={14} className={`transition-transform duration-200 ${isBusinessMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isBusinessMenuOpen && renderDropdown(businessMenuItems, () => setIsBusinessMenuOpen(false))}
              </div>

              {/* Partners Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setIsPartnerMenuOpen(true)}
                onMouseLeave={() => setIsPartnerMenuOpen(false)}
              >
                <button
                  className="text-gray-600 hover:text-[#00843D] font-medium transition-colors text-sm flex items-center gap-1 focus:outline-none py-2"
                >
                  {t.partners} <ChevronDown size={14} className={`transition-transform duration-200 ${isPartnerMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPartnerMenuOpen && renderDropdown(partnerMenuItems, () => setIsPartnerMenuOpen(false))}
              </div>

              <button
                onClick={() => handleNavigation('#help')}
                className="text-gray-600 hover:text-[#00843D] font-medium transition-colors text-sm flex items-center gap-1"
              >
                {t.help}
              </button>

              <div className="h-6 w-px bg-gray-200 mx-2"></div>

              {/* Wallet Widget Toggle (Desktop) */}
              {user && (
                <button
                  onClick={() => setIsWalletOpen(!isWalletOpen)}
                  className="hidden md:flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/40 px-3 py-1.5 rounded-full hover:bg-white/80 transition-colors"
                >
                  <Wallet size={18} />
                  <span className="text-sm font-bold">{user.wallet_balance.toLocaleString()} ETB</span>
                </button>
              )}


              {/* Cart Trigger */}
              <button
                onClick={onCartClick}
                className="relative text-gray-500 hover:text-[#00843D] transition-colors p-2"
                aria-label="Shopping Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#DA121A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* App Mode Toggle (Hidden for now as per request) */}

              {/* Language Toggle */}
              <button
                type="button"
                onClick={toggleLang}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-900 px-3 py-1 rounded-full border border-gray-200 hover:border-gray-400 transition-all text-xs font-semibold"
              >
                <Globe size={14} />
                {lang === 'EN' ? 'EN' : 'አማ'}
              </button>

              {/* Auth Button or User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full transition-all"
                  >
                    <img src={user.profile_image_url || "https://i.pravatar.cc/150"} alt={user.full_name} className="w-6 h-6 rounded-full" />
                    <span className="text-sm font-bold text-gray-700 max-w-[100px] truncate">{user.full_name.split(' ')[0]}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="font-bold text-gray-900 truncate">{user.full_name}</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsProfileOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <UserIcon size={16} /> {t.myAccount}
                        </button>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            if (onOpenOrders) onOpenOrders();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <ShoppingBag size={16} /> {t.orders}
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut size={16} /> {t.logout}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  id="nav-signin-btn"
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-[#00843D] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#006B31] transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5"
                >
                  {t.signIn}
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-4">
              <button
                type="button"
                onClick={toggleLang}
                className="flex items-center gap-1 text-gray-500 text-xs font-semibold"
              >
                {lang === 'EN' ? 'EN' : 'አማ'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none p-1"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden fixed inset-0 top-20 bg-white z-50 overflow-y-auto pb-20 animate-in slide-in-from-right duration-300">
            <div className="px-4 pt-4 pb-6 space-y-2">

              {user ? (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-4">
                    <img src={user.profile_image_url || "https://i.pravatar.cc/150"} alt="Profile" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Wallet Balance</p>
                      <p className="font-bold text-[#00843D] text-xl">{user.wallet_balance.toLocaleString()} ETB</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsWalletOpen(!isWalletOpen);
                        setIsOpen(false);
                      }}
                      className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold"
                    >
                      Top Up
                    </button>

                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full mt-2 text-center py-2 text-sm text-[#00843D] font-bold border border-green-100 rounded-lg bg-green-50 mb-2"
                  >
                    {t.myAccount}
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      if (onOpenOrders) onOpenOrders();
                    }}
                    className="w-full text-center py-2 text-sm text-[#00843D] font-bold border border-green-100 rounded-lg bg-green-50 mb-2 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={16} /> {t.orders}
                  </button>
                  <button onClick={handleLogout} className="w-full text-center py-2 text-sm text-red-600 font-bold border border-red-100 rounded-lg bg-red-50">{t.logout}</button>

                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsLoginOpen(true);
                    }}
                    className="w-full bg-[#00843D] text-white px-5 py-3 rounded-lg font-bold hover:bg-[#006B31] transition-colors active:scale-95 transform"
                  >
                    {t.signIn}
                  </button>
                </div>
              )}

              {/* Mobile Accordions */}

              {/* Food */}
              <div>
                <button
                  onClick={() => setMobileFoodOpen(!mobileFoodOpen)}
                  className="flex items-center justify-between w-full text-left text-gray-700 font-bold text-lg py-3 border-b border-gray-50 hover:text-[#00843D]"
                >
                  {t.home}
                  {mobileFoodOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {mobileFoodOpen && (
                  <div className="pl-4 py-2 space-y-2 bg-gray-50 rounded-b-xl animate-in slide-in-from-top-2">
                    {foodMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsOpen(false);
                          if (item.action) item.action();
                        }}
                        className="w-full text-left py-2.5 text-sm text-gray-600 flex items-center gap-3 active:text-[#00843D]"
                      >
                        <item.icon size={16} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mart */}
              <div>
                <button
                  onClick={() => setMobileMartOpen(!mobileMartOpen)}
                  className="flex items-center justify-between w-full text-left text-gray-700 font-bold text-lg py-3 border-b border-gray-50 hover:text-[#00843D]"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} /> {t.mart}
                  </div>
                  {mobileMartOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {mobileMartOpen && (
                  <div className="pl-4 py-2 space-y-2 bg-gray-50 rounded-b-xl animate-in slide-in-from-top-2">
                    {martMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsOpen(false);
                          if (item.action) item.action();
                        }}
                        className="w-full text-left py-2.5 text-sm text-gray-600 flex items-center gap-3 active:text-[#00843D]"
                      >
                        <item.icon size={16} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Business */}
              <div>
                <button
                  onClick={() => setMobileBusinessOpen(!mobileBusinessOpen)}
                  className="flex items-center justify-between w-full text-left text-gray-700 font-bold text-lg py-3 border-b border-gray-50 hover:text-[#00843D]"
                >
                  {t.business}
                  {mobileBusinessOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {mobileBusinessOpen && (
                  <div className="pl-4 py-2 space-y-2 bg-gray-50 rounded-b-xl animate-in slide-in-from-top-2">
                    {businessMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsOpen(false);
                          if (item.action) item.action();
                        }}
                        className="w-full text-left py-2.5 text-sm text-gray-600 flex items-center gap-3 active:text-[#00843D]"
                      >
                        <item.icon size={16} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Partners */}
              <div>
                <button
                  onClick={() => setMobilePartnersOpen(!mobilePartnersOpen)}
                  className="flex items-center justify-between w-full text-left text-gray-700 font-bold text-lg py-3 border-b border-gray-50 hover:text-[#00843D]"
                >
                  {t.partners}
                  {mobilePartnersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {mobilePartnersOpen && (
                  <div className="pl-4 py-2 space-y-2 bg-gray-50 rounded-b-xl animate-in slide-in-from-top-2">
                    {partnerMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsOpen(false);
                          if (item.action) item.action();
                        }}
                        className="w-full text-left py-2.5 text-sm text-gray-600 flex items-center gap-3 active:text-[#00843D]"
                      >
                        <item.icon size={16} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavigation('#help')}
                className="block w-full text-left text-gray-700 font-bold text-lg py-3 border-b border-gray-50 hover:text-[#00843D]"
              >
                {t.help}
              </button>
            </div>
          </div>
        )}
        {/* Global Wallet Widget */}
        {user && isWalletOpen && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="fixed inset-0 z-40" onClick={() => setIsWalletOpen(false)}></div>
            <div className="absolute top-0 right-4 sm:right-6 lg:right-8 z-50">
              <WalletWidget user={user} onBalanceUpdate={handleProfileUpdate} />
            </div>
          </div>
        )}
      </nav>

      {/* Login/Signup Modal */}
      {
        isLoginOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetAuthForm}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="h-24 bg-gradient-to-br from-gray-900 to-gray-800 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FCDD09] rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#00843D] rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
                <div className="z-10 flex flex-col items-center">
                  <h2 className="text-white font-bold text-xl mt-2">
                    {authMode === 'SIGNIN' ? t.signinTitle : t.signupTitle}
                  </h2>
                  <p className="text-gray-300 text-xs mt-1">
                    {authMode === 'SIGNIN' ? t.signinDesc : t.signupDesc}
                  </p>
                </div>
                <button onClick={resetAuthForm} className="absolute top-4 right-4 text-white/70 hover:text-white p-2">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {authMode === 'SIGNUP' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameLabel}</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#00843D] focus:border-[#00843D] outline-none transition-all text-gray-800"
                        placeholder="John Doe"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.usernameLabel}</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#00843D] focus:border-[#00843D] outline-none transition-all text-gray-800"
                      placeholder="username"
                      autoFocus={authMode === 'SIGNIN'}
                    />
                  </div>

                  {authMode === 'SIGNUP' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#00843D] focus:border-[#00843D] outline-none transition-all text-gray-800"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.phoneLabel}</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm border-r border-gray-300 pr-2">+251</div>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#00843D] focus:border-[#00843D] outline-none transition-all text-gray-800"
                            placeholder="911 234 567"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.passwordLabel}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-[#00843D] focus:border-[#00843D] outline-none transition-all text-gray-800"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {authMode === 'SIGNUP' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPasswordLabel}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-[#00843D] focus:border-[#00843D] outline-none transition-all text-gray-800"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                  {authMode === 'SIGNUP' && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer" onClick={() => setIsPartnerSignup(!isPartnerSignup)}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPartnerSignup ? 'bg-[#00843D] text-white' : 'bg-gray-200 text-gray-400'}`}>
                        <Store size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900">Sign up as a Partner</p>
                        <p className="text-[10px] text-gray-500">I want to sell products on Afta/አፍታ</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isPartnerSignup ? 'border-[#00843D] bg-[#00843D]' : 'border-gray-300'}`}>
                        {isPartnerSignup && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                    </div>
                  )}

                  {error && (
                    <p className="text-xs text-red-500 mt-1 animate-pulse bg-red-50 p-2 rounded text-center border border-red-100">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#00843D] hover:bg-[#006B31] text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-98 transform mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Please wait...
                      </>
                    ) : (
                      <>
                        {authMode === 'SIGNIN' ? t.signinBtn : t.signupBtn} <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    {authMode === 'SIGNIN' ? t.switchToSignup : t.switchToSignin}{' '}
                    <button onClick={toggleAuthMode} className="text-[#00843D] font-bold hover:underline">
                      {authMode === 'SIGNIN' ? t.signupLink : t.signinLink}
                    </button>
                  </p>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-[10px] text-gray-400">By continuing, you agree to Afta/አፍታ's Terms & Privacy Policy.</p>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Profile Editor Modal */}
      {
        user && (
          <ProfileEditor
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            onUpdate={handleProfileUpdate}
          />
        )
      }
    </>
  );
};

export default Navbar;
