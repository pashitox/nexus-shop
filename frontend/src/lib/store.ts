import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Product, CartItem, Cart } from '../types/api.types';
import { apiClient } from '../types/api';
import { generateSessionId } from '../lib/utils'; // Asegúrate de que esta ruta sea correcta

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
}

interface CartState {
  items: CartItem[];
  sessionId: string | null;
  isLoading: boolean;
  cart: Cart | null;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  setCart: (cart: Cart) => void;
  getTotal: () => number;
  getItemCount: () => number;
  mergeCarts: (userCart: Cart, guestCart: Cart) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await apiClient.login(email, password);
        set({ user: response.user, token: response.token, isAuthenticated: true });
        localStorage.setItem('token', response.token);
      },

      register: async (email, password, name) => {
        const response = await apiClient.register(email, password, name);
        set({ user: response.user, token: response.token, isAuthenticated: true });
        localStorage.setItem('token', response.token);
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('token', token);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: null,
      isLoading: false,
      cart: null,

      addItem: async (product, quantity = 1) => {
        const state = get();
        const sessionId = state.sessionId || generateSessionId();
        await apiClient.addToCart(product.id, quantity, sessionId);
        const cart = await apiClient.getCart(sessionId);
        set({ cart, sessionId });
      },

      removeItem: async (itemId) => {
        await apiClient.removeFromCart(itemId);
        const state = get();
        if (state.cart) {
          const updatedCart = await apiClient.getCart(state.sessionId || undefined);
          set({ cart: updatedCart });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }
        await apiClient.updateCartItem(itemId, quantity);
        const state = get();
        if (state.cart) {
          const updatedCart = await apiClient.getCart(state.sessionId || undefined);
          set({ cart: updatedCart });
        }
      },

      clearCart: () => {
        set({ items: [], cart: null });
      },

      setCart: (cart) => {
        set({ cart });
      },

      getTotal: () => {
        const state = get();
        if (!state.cart?.items) return 0;
        return state.cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      getItemCount: () => {
        const state = get();
        if (!state.cart?.items) return 0;
        return state.cart.items.reduce((count, item) => count + item.quantity, 0);
      },

      mergeCarts: async (userCart, guestCart) => {
        try {
          const mergedItems = [...userCart.items];
          for (const guestItem of guestCart.items) {
            const existingItem = mergedItems.find(item => item.productId === guestItem.productId);
            if (existingItem) {
              await apiClient.updateCartItem(existingItem.id, existingItem.quantity + guestItem.quantity);
            } else {
              await apiClient.addToCart(guestItem.productId, guestItem.quantity);
            }
          }
          const updatedCart = await apiClient.getCart();
          set({ cart: updatedCart });
        } catch (error) {
          console.error('Error merging carts:', error);
          throw error;
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        cart: state.cart,
      }),
    }
  )
);
