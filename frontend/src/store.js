import { create } from 'zustand';

// The URL where our FastAPI backend is running
const API_URL = 'http://localhost:8010';

// We use Zustand for global state management because it's much cleaner than Redux!
const useStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  // Persistent Shopping Bag / Cart State
  cart: (() => {
    try {
      const saved = localStorage.getItem('shopsense_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),
  isCartOpen: false,
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

  addToCart: (product, openDrawer = true) => {
    if (!product) return;
    const { cart } = get();
    const existing = cart.find((item) => item.product_id === product.id);
    let updatedCart;
    if (existing) {
      if (existing.quantity >= product.quantity) {
        alert(`Only ${product.quantity} items available in stock!`);
        return;
      }
      updatedCart = cart.map((item) =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          product_id: product.id,
          title: product.title,
          price: product.price,
          discount: product.discount || 0,
          picture_url: product.picture_url,
          vendor_name: product.vendor_name,
          max_stock: product.quantity,
          quantity: 1,
        },
      ];
    }
    try {
      localStorage.setItem('shopsense_cart', JSON.stringify(updatedCart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
    set({ cart: updatedCart, ...(openDrawer ? { isCartOpen: true } : {}) });
  },

  updateQuantity: (productId, delta) => {
    const { cart } = get();
    const updatedCart = cart
      .map((item) => {
        if (item.product_id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > item.max_stock) {
            alert(`Only ${item.max_stock} units left in stock!`);
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);
    try {
      localStorage.setItem('shopsense_cart', JSON.stringify(updatedCart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
    set({ cart: updatedCart });
  },

  removeFromCart: (productId) => {
    const { cart } = get();
    const updatedCart = cart.filter((item) => item.product_id !== productId);
    try {
      localStorage.setItem('shopsense_cart', JSON.stringify(updatedCart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
    set({ cart: updatedCart });
  },

  clearCart: () => {
    try {
      localStorage.removeItem('shopsense_cart');
    } catch (e) {
      console.error(e);
    }
    set({ cart: [] });
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchCurrentUser: async () => {
    const { token, clearAuth } = get();
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Session expired');
      const data = await response.json();
      set({ user: data, error: null });
    } catch (error) {
      clearAuth();
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      get().setToken(data.access_token);
      await get().fetchCurrentUser();
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (registerData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      // Auto login after registration
      await get().login(registerData.email, registerData.password);
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // API requests with auth helper
  apiFetch: async (endpoint, options = {}) => {
    const { token } = get();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      cache: 'no-store',
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'API request failed');
    }
    
    return response.json();
  }
}));

export default useStore;
