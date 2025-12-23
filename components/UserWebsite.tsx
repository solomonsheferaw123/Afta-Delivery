import React, { useState, useEffect, Suspense } from 'react';
import Navbar from './Navbar';
import ServiceCard from './ServiceCard';
import MarketplaceModal from './MarketplaceModal';
import MyOrdersModal from './MyOrdersModal';
import ExpressWidget from './ExpressWidget';
import ConnectFeed from './ConnectFeed';
import TrackingWidget from './TrackingWidget';
import PartnerMobileApp from './PartnerMobileApp';
import UserMobileApp from './UserMobileApp';
import {
  Utensils, ShoppingCart, Package, Pill, Search, MapPin,
  ArrowRight, Smartphone, Star, CheckCircle2, ChevronRight,
  Truck, User, Store, ShieldCheck, Phone, ShoppingBag, Wallet, Users, LayoutGrid,
  Plus, ArrowUpRight, Loader2, Activity, Map, Briefcase
} from 'lucide-react';
import { ServiceItem, Testimonial, Partner, User as UserType } from '../types';
import { getVariant } from '../utils/abTesting';
import MobileFloatingCTA from './MobileFloatingCTA';
import { dataService } from '../services/dataService';
import { IMAGES } from '../imageRegistry';

const ChatWidget = React.lazy(() => import('./ChatWidget'));
const HowItWorks = React.lazy(() => import('./HowItWorks'));
const CityCoverage = React.lazy(() => import('./CityCoverage'));

// Custom hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

// ... (fallback data) ...
const defaultServices: ServiceItem[] = [
  { id: '1', title: 'Afta/አፍታ Food', description: 'Hungry? Get meals from top Addis restaurants delivered in 30-45 minutes.', deliveryTime: '30-45 min', Icon: Utensils, cta: 'Order Food' },
  { id: '2', title: 'Afta/አፍታ Mart', description: 'Marketplace for groceries, electronics, and local fashion brands.', deliveryTime: 'Same Day', Icon: ShoppingBag, cta: 'Shop Mart' },
  { id: '3', title: 'Afta/አፍታ Express', description: 'Professional logistics for documents and city-to-city shipping.', deliveryTime: 'Urgent', Icon: Truck, cta: 'Send Package' },
  { id: '4', title: 'Afta/አፍታ Connect', description: 'Join the community. Read reviews, share recipes, and find events.', deliveryTime: 'Community', Icon: Users, cta: 'Join Now' },
];

const defaultPartners: Partner[] = [
  { id: '1', name: 'Sishu Burger', rating: 4.9, category: 'Top Burger Joint', deliveryTime: '30 min', image: IMAGES.sishu_burger },
  { id: '2', name: 'Lime Tree (Kazanchis)', rating: 4.7, category: 'International', deliveryTime: '35 min', image: IMAGES.lime_tree },
  { id: '3', name: 'Daily Supermarket', rating: 4.5, category: 'Grocery', deliveryTime: '60 min', image: IMAGES.daily_supermarket },
  { id: '4', name: 'Bole Pharmacy', rating: 4.8, category: 'Health', deliveryTime: '45 min', image: IMAGES.bole_pharmacy },
  { id: '5', name: 'Rodeo Cafe', rating: 4.7, category: 'Cafe', deliveryTime: '25 min', image: IMAGES.rodeo_cafe },
];

const testimonials: Testimonial[] = [
  { id: '1', name: 'Addis Accounting', role: 'Corporate Client', text: 'Afta/አፍታ Business has simplified our employee lunch program. One invoice for 50+ staff meals.', avatar: IMAGES.user_1 },
  { id: '2', name: 'Mikias T.', role: 'Afta/አፍታ Pay User', text: 'I love earning 10% cashback when I pay with Afta/አፍታ Wallet. It really adds up!', avatar: IMAGES.user_2 },
  { id: '3', name: 'Dawit M.', role: 'Senior Courier', text: 'The new courier recognition program in Afta/አፍታ Connect makes me feel appreciated.', avatar: IMAGES.user_3 },
];

const getIconComponent = (iconName: string) => {
  const icons: any = { Utensils, ShoppingBag, Truck, Users, Package, Pill };
  return icons[iconName] || Store;
};

interface UserWebsiteProps {
  currentUser: UserType | null;
  onLogout: () => void;
  onUserUpdate: (user: UserType) => void;
}

function UserWebsite({ currentUser, onLogout, onUserUpdate }: UserWebsiteProps) {
  const [trackId, setTrackId] = useState('');
  const [address, setAddress] = useState('');
  const [heroHeadline, setHeroHeadline] = useState('');

  // Modal States
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [marketplaceTab, setMarketplaceTab] = useState<'FOOD' | 'MART'>('FOOD');
  const [marketplaceCategory, setMarketplaceCategory] = useState<string>('ALL');
  const [isExpressOpen, setExpressOpen] = useState(false);
  const [isConnectOpen, setConnectOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [viewMode, setViewMode] = useState<'WEB' | 'APP'>('WEB');

  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) setViewMode('APP');
  }, [isMobile]);

  // Dynamic Content State
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);
  const [partners, setPartners] = useState<Partner[]>(defaultPartners);

  useEffect(() => {
    // A/B Test Variant
    const variants = [
      "Afta/አፍታ Means All. <br/><span class='text-[#00843D]'>Everything Ethiopia.</span>",
      "Food, Groceries <br/><span class='text-[#00843D]'>& More Delivered Fast.</span>",
    ];
    setHeroHeadline(getVariant('hero-headline-001', variants));

    // Fetch Content
    const fetchData = async () => {
      const data = await dataService.getDashboardData();
      if (data) {
        if (data.services && data.services.length > 0) {
          const mappedServices = data.services.map((s: any) => ({
            id: s.id,
            title: s.title.replace('Zemen', 'Afta/አፍታ'),
            description: s.description,
            deliveryTime: s.delivery_time,
            Icon: getIconComponent(s.icon_name),
            cta: s.cta_text || s.cta || 'Order Now'
          }));
          setServices(mappedServices);
        }
        if (data.partners && data.partners.length > 0) {
          const mappedPartners = data.partners.map((p: any) => ({
            id: p.id,
            name: p.name,
            rating: parseFloat(p.rating),
            category: p.category,
            deliveryTime: p.delivery_time,
            image: p.image_url || 'https://picsum.photos/300/200'
          }));
          setPartners(mappedPartners);
        }
      }
    };
    fetchData();
  }, []);

  const handleTrack = (order?: any) => {
    if (order) {
      setTrackingOrder(order);
    } else {
      setTrackingOrder(null);
    }
    setIsTrackingOpen(true);
  };

  const handleOpenMarketplace = (tab: 'FOOD' | 'MART', category: string = 'ALL') => {
    setMarketplaceTab(tab);
    setMarketplaceCategory(category);
    setIsMarketplaceOpen(true);
  };

  const handleOpenExpress = () => setExpressOpen(true);
  const handleOpenConnect = () => setConnectOpen(true);

  const handleAddToCart = (count: number) => {
    setCartCount(prev => prev + count);
  };

  const handleOrderSuccess = () => {
    setIsMarketplaceOpen(false);
    // Optionally show success message or update state
  };

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePartnerLogin = () => {
    if (!currentUser) {
      alert("Please sign in with your Partner Account credentials.");
    } else {
      // In UserWebsite, we only show this alert. Redirect logic is handled by Routing in App.tsx
      alert("Please logout and sign in with a Partner account.");
    }
  };

  const preventNav = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const LoadingFallback = () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-[#00843D]" size={32} />
    </div>
  );

  if (viewMode === 'APP' && (!currentUser || currentUser.user_type === 'customer')) {
    return (
      <>
        <UserMobileApp
          user={currentUser}
          onLogout={onLogout}
          onOpenLogin={() => {
            const navBtn = document.getElementById('nav-signin-btn');
            if (navBtn) navBtn.click();
          }}
          onOpenService={(type) => {
            if (type === 'FOOD') handleOpenMarketplace('FOOD');
            if (type === 'MART') handleOpenMarketplace('MART');
            if (type === 'EXPRESS') setExpressOpen(true);
            if (type === 'CONNECT') setConnectOpen(true);
          }}
          onUserUpdate={onUserUpdate}
        />
        <MarketplaceModal
          isOpen={isMarketplaceOpen}
          onClose={() => setIsMarketplaceOpen(false)}
          initialTab={marketplaceTab}
          initialCategory={marketplaceCategory}
          onAddToCart={handleAddToCart}
          onOrderSuccess={onUserUpdate}
        />
        <TrackingWidget
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
          order={trackingOrder}
        />
        <ExpressWidget
          isOpen={isExpressOpen}
          onClose={() => setExpressOpen(false)}
        />
        <ConnectFeed
          isOpen={isConnectOpen}
          onClose={() => setConnectOpen(false)}
        />
        <MyOrdersModal
          isOpen={isOrdersOpen}
          onClose={() => setIsOrdersOpen(false)}
          onTrackOrder={(order) => handleTrack(order)}
        />
      </>
    );
  }

  // Admin and Partner logic removed from here
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-gray-900 pb-20 lg:pb-0 leading-relaxed break-words">
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setIsMarketplaceOpen(true)}
        onLoginClick={() => { }}
        onOpenFood={() => handleOpenMarketplace('FOOD')}
        onOpenMart={(category) => handleOpenMarketplace('MART', category || 'ALL')}
        onOpenBusiness={() => handleScrollTo('business')}
        onOpenPartners={() => handleScrollTo('business')}
        onOpenPartnerLogin={handlePartnerLogin}
        onOpenTracking={handleTrack}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onSwitchToApp={() => setViewMode(prev => prev === 'WEB' ? 'APP' : 'WEB')}
      />


      {/* SUPER-APP HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 bg-gray-50">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#E6F4EA] rounded-l-[100px]"></div>
          {/* OPTIMIZED: Responsive image loading with srcset for mobile performance */}
          <img
            src={IMAGES.hero_bg}
            srcSet={`${IMAGES.hero_bg} 640w, ${IMAGES.hero_bg} 1200w`}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="absolute top-0 right-0 w-1/2 h-full object-cover opacity-10 mix-blend-overlay"
            alt="Addis Pattern"
            // @ts-ignore
            fetchPriority="high"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Hero Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <span className="bg-[#FCDD09] text-yellow-900 font-bold px-4 py-1.5 rounded-full text-sm inline-block mb-6 border border-yellow-200 shadow-sm">
              🚀 Afta/አፍታ Pay is Live! | Get 10% Cashback
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
              <span className="text-[#DA121A]">Afta</span><span className="text-gray-400 font-light mx-1">/</span><span className="text-[#00843D]">አፍታ</span> Means All. <br />
              <span className="text-gray-800">Everything Ethiopia.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Food, Mart, Wallet, and Community. The operating system for commerce in Addis Ababa and beyond.
            </p>

            {/* Primary Action */}
            <div className="bg-white p-2 rounded-full shadow-xl border border-gray-100 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto lg:mx-0 mb-6">
              <div className="flex-1 flex items-center px-4 h-12 sm:h-auto">
                <LayoutGrid className="text-gray-400 mr-3" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="What do you need today?"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => handleOpenMarketplace('FOOD')}
                className="bg-[#00843D] hover:bg-[#006B31] text-white px-8 py-3 rounded-full font-bold transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Order Now
              </button>
            </div>

            {/* Afta/አፍታ Pay Teaser */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-rose-600 font-bold cursor-pointer hover:underline" onClick={handleTrack}>
                <Map size={18} />
                Track Order
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-[10px] font-bold text-yellow-900 shadow-sm">TB</div>
                  <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">CBE</div>
                </div>
                <span className="text-xs font-medium text-gray-500">Pay with Telebirr & CBE</span>
              </div>
            </div>
          </div>

          {/* Hero Interface Mockup - Replaces Static Image for Better "Working" Visualization */}
          <div className="lg:w-1/2 flex justify-center relative">
            <div className="relative z-10 w-full max-w-md mx-auto flex justify-center">
              {/* Abstract Shapes */}
              <div className="absolute top-20 left-10 w-32 h-32 bg-[#FCDD09] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#00843D] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-10 left-20 w-32 h-32 bg-[#DA121A] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

              {/* Phone Frame */}
              <div className="relative mx-auto border-gray-900 bg-gray-900 border-[12px] rounded-[2.5rem] h-[580px] w-[290px] shadow-2xl flex flex-col z-20 transform hover:scale-[1.02] transition-transform duration-500">
                {/* Buttons */}
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[14px] top-[72px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[14px] top-[124px] rounded-l-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[14px] top-[142px] rounded-r-lg"></div>

                {/* Screen */}
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-gray-50 flex flex-col relative">
                  {/* Status Bar */}
                  <div className="bg-white px-6 pt-3 pb-2 flex justify-between items-center text-[10px] font-bold text-gray-800 select-none">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                      <span>5G</span>
                      <div className="w-4 h-2.5 bg-gray-800 rounded-[2px] opacity-80"></div>
                    </div>
                  </div>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-xl z-30"></div>

                  {/* App Content */}
                  <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50 pt-4 px-4 pb-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Good morning,</p>
                        <h4 className="font-bold text-gray-800 text-lg">Dawit</h4>
                      </div>
                      <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img src={IMAGES.user_2} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                    </div>

                    {/* Wallet Card */}
                    <div className="bg-gradient-to-br from-[#00843D] to-[#006B31] rounded-2xl p-4 text-white shadow-lg mb-6 relative overflow-hidden group cursor-pointer">
                      <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
                          <Wallet size={12} className="text-white" />
                          <span className="text-[10px] font-bold">Afta/አፍታ Pay</span>
                        </div>
                        <span className="text-[10px] bg-[#FCDD09] text-yellow-900 px-1.5 py-0.5 rounded font-bold shadow-sm">Verified</span>
                      </div>
                      <p className="text-xs opacity-80 mb-0.5">Total Balance</p>
                      <h3 className="text-2xl font-bold mb-4">1,250.00 <span className="text-xs font-normal opacity-80">ETB</span></h3>
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"><Plus size={14} /></div>
                          <span className="text-[8px] font-medium">Top Up</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"><ArrowUpRight size={14} /></div>
                          <span className="text-[8px] font-medium">Send</span>
                        </div>
                      </div>
                    </div>

                    {/* Services Grid */}
                    <h5 className="font-bold text-gray-800 mb-3 text-sm">Services</h5>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div
                        onClick={() => handleOpenMarketplace('FOOD')}
                        className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-orange-50 hover:border-orange-100 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                          <Utensils size={18} />
                        </div>
                        <span className="font-bold text-xs text-gray-700">Food</span>
                      </div>
                      <div
                        onClick={() => handleOpenMarketplace('MART')}
                        className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-100 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                          <ShoppingBag size={18} />
                        </div>
                        <span className="font-bold text-xs text-gray-700">Mart</span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-100 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <Truck size={18} />
                        </div>
                        <span className="font-bold text-xs text-gray-700">Express</span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-100 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <Users size={18} />
                        </div>
                        <span className="font-bold text-xs text-gray-700">Connect</span>
                      </div>
                    </div>

                    {/* Recent Order */}
                    <h5 className="font-bold text-gray-800 mb-3 text-sm">Active Order</h5>
                    <div onClick={handleTrack} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img src={IMAGES.burger_thumb} className="w-full h-full object-cover" alt="Burger" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-800">Sishu Burger</p>
                        <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          Arriving in 12 mins
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center">
                        <ChevronRight size={14} className="text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Nav Mockup */}
                  <div className="bg-white border-t border-gray-100 h-14 flex justify-around items-center px-2 z-20">
                    <div className="flex flex-col items-center gap-1 text-[#00843D]">
                      <LayoutGrid size={20} />
                      <div className="w-1 h-1 bg-[#00843D] rounded-full"></div>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-gray-300">
                      <Search size={20} />
                    </div>
                    <div className="flex flex-col items-center gap-1 text-gray-300">
                      <ShoppingBag size={20} />
                    </div>
                    <div className="flex flex-col items-center gap-1 text-gray-300">
                      <User size={20} />
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-gray-900 rounded-full z-30"></div>
                </div>
              </div>

              {/* Floating Elements */}
              {/* Clicking the delivery notification also opens tracking */}
              <div onClick={handleTrack} className="absolute top-20 -right-4 bg-white p-3 rounded-xl shadow-xl z-30 flex items-center gap-3 animate-bounce duration-[3000ms] cursor-pointer hover:scale-105 transition-transform">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xs">Order Delivered</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section >

      {/* STATS BAR */}
      < section className="py-10 bg-[#00843D] text-white" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center divide-x divide-green-600/30">
            {/* Added Live Orders Trust Element */}
            <div className="flex flex-col items-center">
              <Activity size={32} className="text-[#FCDD09] mb-2 animate-pulse" />
              <span className="text-3xl font-bold">142</span>
              <span className="text-sm text-green-100 uppercase tracking-wider">Live Orders</span>
            </div>
            <div className="flex flex-col items-center">
              <ShoppingBag size={32} className="text-[#FCDD09] mb-2" />
              <span className="text-3xl font-bold">500+</span>
              <span className="text-sm text-green-100 uppercase tracking-wider">Mart SKUs</span>
            </div>
            <div className="flex flex-col items-center">
              <User size={32} className="text-[#FCDD09] mb-2" />
              <span className="text-3xl font-bold">68k</span>
              <span className="text-sm text-green-100 uppercase tracking-wider">Total Visitors</span>
            </div>
            <div className="flex flex-col items-center">
              <Wallet size={32} className="text-[#FCDD09] mb-2" />
              <span className="text-3xl font-bold">10%</span>
              <span className="text-sm text-green-100 uppercase tracking-wider">Cashback</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck size={32} className="text-[#FCDD09] mb-2" />
              <span className="text-3xl font-bold">34min</span>
              <span className="text-sm text-green-100 uppercase tracking-wider">Avg Delivery</span>
            </div>
          </div>
        </div>
      </section >

      {/* HOW IT WORKS */}
      < Suspense fallback={null} >
        <HowItWorks />
      </Suspense >

      {/* THE ECOSYSTEM */}
      < section id="ecosystem" className="py-20 bg-gray-50 border-t border-gray-100" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[#DA121A] font-bold tracking-widest uppercase text-sm mb-2">The Ecosystem</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">More than just delivery.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="cursor-pointer">
              <ServiceCard
                item={services[0]}
                colorClass="bg-orange-500"
                onClick={() => handleOpenMarketplace('FOOD')}
              />
            </div>
            <div className="cursor-pointer">
              <ServiceCard
                item={services[1]}
                colorClass="bg-purple-600"
                onClick={() => handleOpenMarketplace('MART')}
              />
            </div>
            {/* For Express and Connect */}
            <div className="cursor-pointer">
              <ServiceCard
                item={services[2]}
                colorClass="bg-blue-600"
                onClick={handleOpenExpress}
              />
            </div>
            <div className="cursor-pointer">
              <ServiceCard
                item={services[3]}
                colorClass="bg-green-600"
                onClick={handleOpenConnect}
              />
            </div>
          </div>
        </div>
      </section >

      {/* AFTA/አፍታ PAY INTEGRATION - ENHANCED */}
      < section id="pay" className="py-20 bg-gray-900 text-white relative overflow-hidden" >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose-500/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10 pt-20">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6 border border-white/10">
                <Wallet size={16} className="text-[#FCDD09]" />
                <span className="text-sm font-bold">Introducing Afta/አፍታ Pay</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">The Smartest Way to Pay</h2>
              <p className="text-gray-300 text-lg mb-8">
                Seamlessly integrated with Ethiopia's top payment providers. Top up your Afta/አፍታ Wallet and enjoy instant checkouts, cashbacks, and exclusive rewards.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="text-[#FCDD09] font-bold text-xl mb-1">10%</div>
                  <div className="text-sm text-gray-400">Cashback on 1st Top-up</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="text-[#FCDD09] font-bold text-xl mb-1">0 Fee</div>
                  <div className="text-sm text-gray-400">Instant Transfers</div>
                </div>
              </div>
              <button className="bg-[#00843D] hover:bg-[#006B31] text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-green-900/50 flex items-center gap-2">
                <Wallet size={20} /> Activate Wallet
              </button>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl flex items-center justify-center h-32 opacity-90 hover:opacity-100 transition-opacity cursor-pointer group">
                <span className="text-gray-900 font-bold text-xl group-hover:scale-105 transition-transform">telebirr</span>
              </div>
              <div className="bg-white p-6 rounded-2xl flex items-center justify-center h-32 opacity-90 hover:opacity-100 transition-opacity cursor-pointer group">
                <span className="text-purple-900 font-bold text-xl group-hover:scale-105 transition-transform">CBE Birr</span>
              </div>
              <div className="bg-white p-6 rounded-2xl flex items-center justify-center h-32 opacity-90 hover:opacity-100 transition-opacity cursor-pointer group">
                <span className="text-green-700 font-bold text-xl group-hover:scale-105 transition-transform">M-Pesa</span>
              </div>
              <div className="bg-white p-6 rounded-2xl flex items-center justify-center h-32 opacity-90 hover:opacity-100 transition-opacity cursor-pointer group">
                <span className="text-blue-900 font-bold text-xl group-hover:scale-105 transition-transform">Awash</span>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* COMMUNITY / CONNECT (NEW) */}
      < section id="connect" className="py-20 bg-white" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Afta/አፍታ Connect Community</h2>
            <p className="mt-4 text-gray-600">Real stories from the people who power our platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 relative group hover:shadow-lg transition-all">
                <div className="absolute top-6 right-6 text-gray-300 group-hover:text-[#00843D] transition-colors">
                  <Users size={24} />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" loading="lazy" />
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-[#00843D] font-bold uppercase">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* FEATURED PARTNERS (MART & FOOD) */}
      < section id="mart" className="py-20 bg-gray-50 border-y border-gray-100 overflow-hidden" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Trending on Afta/አፍታ Mart</h2>
              <p className="text-gray-500 mt-2">Top picks from food, groceries, and electronics</p>
            </div>
            <button
              onClick={() => handleOpenMarketplace('MART')}
              className="text-[#00843D] font-bold hover:text-[#006B31] flex items-center gap-1"
            >
              Shop All <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide">
            {partners.map((partner) => (
              <div
                key={partner.id}
                onClick={() => handleOpenMarketplace(partner.category.includes('Grocery') ? 'MART' : 'FOOD')}
                className="min-w-[280px] bg-white rounded-xl shadow border border-gray-100 overflow-hidden snap-start hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="h-40 overflow-hidden">
                  <img src={partner.image} alt={partner.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{partner.name}</h3>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      {partner.rating} <Star size={10} fill="currentColor" />
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{partner.category}</span>
                    <span>{partner.deliveryTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* BUSINESS CTA - REDESIGNED */}
      <section id="business" className="relative py-24 mx-4 my-16 overflow-hidden rounded-[3rem] bg-gray-900 shadow-2xl">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-green-500/10 to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-green-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-yellow-500/10 rounded-full blur-[60px] animate-pulse"></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          {/* Content side */}
          <div className="lg:w-3/5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-8 border border-white/10 backdrop-blur-md">
              <Briefcase size={18} className="text-[#FCDD09]" />
              <span className="text-sm font-bold text-white uppercase tracking-widest">Corporate Solutions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Afta<span className="text-gray-400 font-light mx-1">/</span>አፍታ <span className="text-[#00843D]">for Business</span>
            </h2>
            <p className="text-gray-300 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl">
              Elevate your office productivity. Manage employee meals, corporate events, and office essentials with a single, unified dashboard and one consolidated invoice.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button className="bg-[#00843D] hover:bg-[#006B31] text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-green-900/40 flex items-center gap-2 group">
                Request Corporate Demo <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition-all backdrop-blur-sm">
                View Pricing
              </button>
            </div>
          </div>

          {/* Visual Side / Social Proof */}
          <div className="lg:w-2/5 grid grid-cols-1 gap-4">
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 transform hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FCDD09] rounded-lg flex items-center justify-center text-yellow-900 font-bold">CBE</div>
                <div>
                  <p className="text-white font-bold text-sm">Commercial Bank of Ethiopia</p>
                  <p className="text-gray-400 text-xs">Active Client since 2023</p>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-[#00843D]"></div>
              </div>
              <p className="text-xs text-gray-400 font-medium">50+ daily active employee meal plans</p>
            </div>

            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 transform hover:scale-[1.02] transition-transform delay-75">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">ET</div>
                <div>
                  <p className="text-white font-bold text-sm">Ethio Telecom</p>
                  <p className="text-gray-400 text-xs">Active Client since 2024</p>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="w-[90%] h-full bg-[#00843D]"></div>
              </div>
              <p className="text-xs text-gray-400 font-medium">Region-wide logistics partnership</p>
            </div>
          </div>
        </div>
      </section>





      {/* CITY COVERAGE */}
      < Suspense fallback={< LoadingFallback />}>
        <CityCoverage />
      </Suspense >

      {/* FOOTER */}
      < footer id="help" className="bg-gray-50 pt-16 pb-8 border-t border-gray-200" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-4 gap-2">
                <div className="bg-gradient-to-br from-[#00843D] to-[#006B31] p-1.5 rounded-lg">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-baseline leading-none">


                  <span className="font-black text-xl tracking-tight">
                    <span className="text-[#DA121A]">Afta</span>
                    <span className="text-gray-300 mx-0.5 font-light">/</span>
                    <span className="text-[#00843D]">አፍታ</span>
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                The operating system for Ethiopian commerce. Food, Mart, Wallet, and Community.
              </p>
              <div className="flex gap-2">
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#00843D] hover:text-white transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Ecosystem</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button onClick={preventNav} className="hover:text-[#00843D] transition-colors text-left">Afta/አፍታ Food</button></li>
                <li><button onClick={preventNav} className="hover:text-[#00843D] transition-colors text-left">Afta/አፍታ Mart</button></li>
                <li><button onClick={preventNav} className="hover:text-[#00843D] transition-colors text-left">Afta/አፍታ Pay</button></li>
                <li><button onClick={preventNav} className="hover:text-[#00843D] transition-colors text-left">Afta/አፍታ Express</button></li>
                <li><button onClick={preventNav} className="hover:text-[#00843D] transition-colors text-left">Afta/አፍታ Connect</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button onClick={preventNav} className="hover:text-[#00843D] transition-colors text-left">About Us</button></li>
                <li><button onClick={preventNav} className="hover:text-[#00843D] transition-colors text-left">Careers</button></li>

                <li><button onClick={preventNav} className="hover:text-[#00843D] transition-colors text-left">Press</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Bole Road, Addis Ababa</li>
                <li>011 989 8989</li>
                <li>9898 (Short Code)</li>
              </ul>
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Download App</p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center text-white"><Smartphone size={16} /></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Afta/አፍታ Delivery PLC.</p>
          </div>
        </div>
      </footer >

      {/* Floating Elements */}
      < MobileFloatingCTA />

      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>

      {/* NEW: Modals */}
      <MarketplaceModal
        isOpen={isMarketplaceOpen}
        onClose={() => setIsMarketplaceOpen(false)}
        initialTab={marketplaceTab}
        initialCategory={marketplaceCategory}
        onAddToCart={handleAddToCart}
        onOrderSuccess={handleOrderSuccess}
      />

      <TrackingWidget
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        order={trackingOrder}
      />

      <ExpressWidget
        isOpen={isExpressOpen}
        onClose={() => setExpressOpen(false)}
      />

      <ConnectFeed
        isOpen={isConnectOpen}
        onClose={() => setConnectOpen(false)}
      />

      <MyOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        onTrackOrder={(order) => handleTrack(order)}
      />
    </div >
  );
}


export default UserWebsite;
