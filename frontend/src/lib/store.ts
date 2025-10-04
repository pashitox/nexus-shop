// src/store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Product, CartItem, Cart } from '../types/api.types';
import { apiClient } from '../types/api';
import { generateSessionId } from '../lib/utils';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
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
  loadCart: () => Promise<void>; // ✅ NUEVO: Cargar carrito al iniciar
}




export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await apiClient.login(email, password);
        set({ user: response.data?.user, token: response.data?.token, isAuthenticated: true });
        localStorage.setItem('token', response.data?.token || '');
      },

      register: async (email, password, name) => {
        const response = await apiClient.register(email, password, name);
        set({ user: response.data?.user, token: response.data?.token, isAuthenticated: true });
        localStorage.setItem('token', response.data?.token || '');
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('token', token);
      },

      setUser: (user) => {
        set({ user });
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

      // ✅ Cargar carrito al inicializar
      loadCart: async () => {
        const state = get();
        try {
          set({ isLoading: true });
          const sessionId = state.sessionId || generateSessionId();
          const response = await apiClient.getCart(sessionId);
          set({ 
            cart: response.data || { items: [] },
            sessionId 
          });
        } catch (error) {
          console.error('Error loading cart:', error);
          set({ cart: { items: [] } });
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (product, quantity = 1) => {
        const state = get();
        try {
          set({ isLoading: true });
          const sessionId = state.sessionId || generateSessionId();
          await apiClient.addToCart(product.id, quantity, sessionId);
          const cartResponse = await apiClient.getCart(sessionId);
          set({ 
            cart: cartResponse.data || { items: [] }, 
            sessionId 
          });
        } catch (error) {
          console.error('Error adding item to cart:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (itemId) => {
        try {
          set({ isLoading: true });
          await apiClient.removeFromCart(itemId);
          const state = get();
          const cartResponse = await apiClient.getCart(state.sessionId || undefined);
          set({ cart: cartResponse.data || { items: [] } });
        } catch (error) {
          console.error('Error removing item from cart:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }
        
        try {
          set({ isLoading: true });
          await apiClient.updateCartItem(itemId, quantity);
          const state = get();
          const cartResponse = await apiClient.getCart(state.sessionId || undefined);
          set({ cart: cartResponse.data || { items: [] } });
        } catch (error) {
          console.error('Error updating cart item:', error);
          throw error;
        } finally {
          set({ isLoading: false });
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
              const state = get();
              const sessionId = state.sessionId || generateSessionId();
              await apiClient.addToCart(guestItem.productId, guestItem.quantity, sessionId);
            }
          }
          const state = get();
          const updatedCart = await apiClient.getCart(state.sessionId || undefined);
          set({ cart: updatedCart.data || { items: [] } });
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