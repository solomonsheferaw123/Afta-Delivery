
import { LucideIcon } from 'lucide-react';

export interface FinancialData {
  year: string;
  revenue: number;
  profitOrLoss: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  deliveryTime: string;
  Icon: LucideIcon;
  cta: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  avatar: string;
}

export interface Partner {
  id: string;
  name: string;
  rating: number;
  image: string;
  category: string;
  deliveryTime: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export interface Address {
  id: string;
  label: string; // e.g., Home, Work
  subcity: string; // e.g., Bole, Yeka
  landmark: string; // e.g., Near Edna Mall
  phone_number?: string;
  is_default?: boolean;
}

export interface User {
  id: string; // Matches DB primary key
  username?: string; // New field
  email?: string; // New field
  phone_number: string;
  full_name: string;
  user_type: 'customer' | 'courier' | 'restaurant' | 'business' | 'admin';
  profile_image_url?: string;
  wallet_balance: number;
  is_activated?: boolean; // New: Tracks if wallet is initiated
  is_verified?: boolean; // Front-end helper

  isOffline?: boolean; // Indicates if this is a fallback session
  addresses?: Address[]; // New field for Landmark-based addresses
}

// --- NEW PARTNER TYPES ---

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
}

export interface RestaurantOrder {
  id: string;
  customer_name: string;
  items: { name: string; quantity: number; price: number }[];
  total_amount: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'DELIVERED';
  created_at: Date;
  note?: string;
}

export interface PartnerReview {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  date: string;
}
