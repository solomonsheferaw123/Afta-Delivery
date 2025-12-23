
import { User } from '../types';

const STORAGE_KEY = 'zemen_user_session';
const TOKEN_KEY = 'zemen_auth_token';
// ensure this matches your XAMPP setup exactly
const API_URL = 'http://localhost/zemen-api/auth.php';

export const authService = {
  /**
   * Login with Username and Password
   */
  async login(username: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      if (!username || !password) {
        return { success: false, error: 'Username and password are required' };
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        localStorage.setItem(TOKEN_KEY, 'demo-token');
        return { success: true, user: data.user, token: 'demo-token' };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, error: 'Backend unreachable' };
    }
  },

  /**
   * Sign up with Username, Password, Full Name, Email, and Phone
   */
  async signup(username: string, password: string, fullName: string, email: string, phone: string, userType: string = 'customer'): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      if (!username || !password || !fullName || !phone) {
        return { success: false, error: 'All required fields must be filled' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, fullName, email, phone, userType })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        localStorage.setItem(TOKEN_KEY, 'demo-token');
        return { success: true, user: data.user, token: 'demo-token' };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (error) {
      console.error("Signup Error:", error);
      return { success: false, error: 'Backend unreachable' };
    }
  },

  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string, fullName: string, phone: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', username, email, password, full_name: fullName, phone })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Invalid JSON response from server:", text);
        throw new Error("Invalid response format from server");
      }

      if (data.success && data.user) {
        const userData: User = {
          id: data.user.id || data.user.user_id,
          username: data.user.username,
          email: data.user.email,
          phone_number: data.user.phone_number,
          full_name: data.user.full_name,
          user_type: data.user.user_type,
          profile_image_url: data.user.profile_image_url,
          wallet_balance: parseFloat(data.user.wallet_balance || 0),
          isOffline: false,
          addresses: []
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        localStorage.setItem(TOKEN_KEY, data.token || 'new-token');

        return { success: true, user: userData, token: data.token };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error("Register API Error:", error);

      // Fallback
      console.warn("Backend unreachable. Using offline registration fallback.");

      const mockUser: User = {
        id: `offline-${Date.now()}`,
        username: username,
        email: email,
        phone_number: phone,
        full_name: fullName,
        user_type: 'customer',
        profile_image_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00843D&color=fff`,
        wallet_balance: 0,
        isOffline: true,
        addresses: []
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      const token = 'demo-offline-token';
      localStorage.setItem(TOKEN_KEY, token);

      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ success: true, user: mockUser, token });
        }, 1000);
      });
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Optimistic update for offline/demo users
      const currentUser = this.getCurrentUser();

      if (currentUser?.isOffline || userId.startsWith('demo') || userId.startsWith('offline') || userId.startsWith('user-') || userId.startsWith('partner-')) {
        const updatedUser = { ...currentUser, ...updates } as User;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, user: updatedUser });
          }, 800);
        });
      }

      // Real API Call
      const token = this.getToken();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'update_profile',
          user_id: userId,
          ...updates
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid response");
      }

      if (data.success && data.user) {
        // Merge backend response with local structure
        const updatedUser = {
          ...currentUser,
          ...data.user,
          // Keep addresses from local updates if backend doesn't return them yet
          addresses: updates.addresses || currentUser?.addresses || [],
          // Ensure wallet balance persists correctly if backend doesn't return it on update
          wallet_balance: data.user.wallet_balance ? parseFloat(data.user.wallet_balance) : currentUser?.wallet_balance
        } as User;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: data.error || 'Update failed' };
      }
    } catch (error) {
      console.error("Update Profile Error:", error);

      // Fallback: If network fails, update local storage so user sees changes in this session (Optimistic UI)
      // This allows the feature to work even if the PHP backend isn't set up yet.
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates } as User;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }
      return { success: false, error: 'Connection failed' };
    }
  },

  /**
   * Diagnostic: Test connection to backend
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping' })
      });

      if (response.ok) {
        return { success: true, message: "✅ Connection Successful! The app can see your Database." };
      }

      if (response.status === 404) {
        return { success: false, message: "❌ Error 404: 'auth.php' not found. Check if the folder is named 'zemen-api' in htdocs." };
      }

      return { success: false, message: `❌ Server Error: ${response.status} ${response.statusText}` };
    } catch (e) {
      return { success: false, message: "❌ Network Error: Is XAMPP Apache running? Check Console." };
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  saveUser(user: User) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  async activateWallet(userId: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (data.success) {
        this.saveUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Connection failed' };
    }
  }
};


