import { ServiceItem, Partner } from '../types';
import { authService } from './authService';

// Updated to point to local Node backend (proxied via Vite)
const API_URL = '/api/dashboard';

const BASE_URL = '/api';

export const dataService = {
  async getDashboardData(): Promise<{ services: any[], partners: any[] } | null> {
    try {
      const response = await fetch(`${BASE_URL}/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      return await response.json();
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      // Return mock data for demo
      return {
        services: [
          { id: 1, name: 'Food Delivery', description: 'Order from your favorite restaurants', icon: '🍕', is_active: 1 },
          { id: 2, name: 'Grocery Shopping', description: 'Fresh groceries delivered to your door', icon: '🛒', is_active: 1 },
          { id: 3, name: 'Package Delivery', description: 'Send packages across the city', icon: '📦', is_active: 1 },
          { id: 4, name: 'Digital Wallet', description: 'Pay and transfer money securely', icon: '💳', is_active: 1 }
        ],
        partners: [
          { id: 1, name: 'Bole Pharmacy', rating: 4.5, image_url: 'images/bole_pharmacy.jpg' },
          { id: 2, name: 'Burger Thumb', rating: 4.8, image_url: 'images/burger_thumb.jpg' },
          { id: 3, name: 'Daily Supermarket', rating: 4.2, image_url: 'images/daily_supermarket.jpg' }
        ]
      };
    }
  },

  async getProducts(partnerId?: string, category?: string): Promise<any[]> {
    try {
      let url = `${BASE_URL}/products`;
      const params = new URLSearchParams();
      if (partnerId) params.append('partnerId', partnerId);
      if (category) params.append('category', category);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error("Products fetch error:", error);
      // Return mock products
      return [
        { id: 1, name: 'Pizza Margherita', price: 250, image_url: 'images/product_placeholder.jpg', category: 'Food', partner_id: 1 },
        { id: 2, name: 'Burger', price: 180, image_url: 'images/burger_thumb.jpg', category: 'Food', partner_id: 2 },
        { id: 3, name: 'Milk', price: 50, image_url: 'images/daily_supermarket.jpg', category: 'Grocery', partner_id: 3 }
      ];
    }
  },

  async placeOrder(orderData: { userId: number, partnerId: number, totalAmount: number, items: any[] }): Promise<{ success: boolean, orderId?: number, user?: any, error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async requestExpress(expressData: { userId: number, pickup: string, dropoff: string, type: string, vehicle: string, price: number }): Promise<{ success: boolean, requestId?: number, error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/express`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expressData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async getUserOrders(userId: number): Promise<{ success: boolean, orders?: any[], error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/orders/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return await response.json();
    } catch (error) {
      console.error("Orders fetch error:", error);
      return { success: false, error: 'Network error' };
    }
  },

  async getPartnerOrders(partnerId: number): Promise<{ success: boolean, orders?: any[], error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/partner/orders/${partnerId}`);
      if (!response.ok) throw new Error('Failed to fetch partner orders');
      return await response.json();
    } catch (error) {
      console.error("Partner orders fetch error:", error);
      return { success: false, error: 'Network error' };
    }
  },

  async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean, error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async addProduct(productData: { partnerId: number, name: string, description: string, price: number, category: string, image_url: string }): Promise<{ success: boolean, product?: any, error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async updateProduct(id: string, productData: any): Promise<{ success: boolean, error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async deleteProduct(id: string): Promise<{ success: boolean, error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async simulatePayment(userId: number, amount: number, provider: string): Promise<{ success: boolean, user?: any, message?: string, error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/payment/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, provider })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async initializeChapaPayment(paymentData: { userId: number, amount: number, email?: string, fullName: string }): Promise<{ success: boolean, checkout_url?: string, tx_ref?: string, error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/payment/chapa/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async verifyChapaPayment(tx_ref: string): Promise<{ success: boolean, user?: any, message?: string, error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/payment/chapa/verify/${tx_ref}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async transferFunds(transferData: { senderId: number, receiverPhone: string, amount: number }): Promise<{ success: boolean, user?: any, message?: string, error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/wallet/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async getWalletTransactions(userId: number): Promise<{ success: boolean, transactions?: any[], error?: string }> {

    try {
      const response = await fetch(`${BASE_URL}/wallet/transactions/${userId}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async getAdminStats(): Promise<{ success: boolean, stats?: any, recentUsers?: any[], error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/admin/stats`);
      if (!response.ok) throw new Error('Failed to fetch admin stats');
      return await response.json();
    } catch (error) {
      console.error("Admin stats fetch error:", error);
      return { success: false, error: 'Network error' };
    }
  },

  async getAdminUsers(): Promise<{ success: boolean, users?: any[], error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/admin/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (error) {
      console.error("Admin users fetch error:", error);
      return { success: false, error: 'Network error' };
    }
  },

  async getAdminPartners(): Promise<{ success: boolean, partners?: any[], error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/admin/partners`);
      if (!response.ok) throw new Error('Failed to fetch partners');
      return await response.json();
    } catch (error) {
      console.error("Admin partners fetch error:", error);
      return { success: false, error: 'Network error' };
    }
  },

  async addPartner(partnerData: { name: string, category: string, image_url: string, delivery_time: string }): Promise<{ success: boolean, partner?: any, error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/admin/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnerData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }
};