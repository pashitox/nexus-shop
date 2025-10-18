import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Product, CartItem, Cart } from '../types/api.types';
import { apiClient } from '../types/api';
import { generateSessionId } from '../lib/utils';

/* ==========================
   AUTH STORE
========================== */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null; // ✅ AGREGADO
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void; // ✅ AGREGADO
  // ✅ NUEVO: Login con fusión automática de carrito
  loginWithCartMerge: (email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null, // ✅ INICIALIZADO

      // 🔹 LOGIN NORMAL
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.login(email, password);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            token: response.data.token, // ✅ GUARDADO
          });
          localStorage.setItem('token', response.data.token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // 🔹 REGISTRO
      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.register(email, password, name);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            token: response.data.token, // ✅ GUARDADO
          });
          localStorage.setItem('token', response.data.token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // 🔹 LOGIN CON GOOGLE + FUSIÓN DE CARRITO
      googleLogin: async (googleToken: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.googleLogin(googleToken);
          const { user, token } = response.data;

          // ✅ Guardar token
          localStorage.setItem('token', token);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            token,
          });

          // ✅ FUSIONAR CARRITO DESPUÉS DEL LOGIN GOOGLE
          setTimeout(async () => {
            try {
              const cartStore = useCartStore.getState();
              await cartStore.mergeGuestCartWithUser(user.id);
            } catch (error) {
              console.error('Error en fusión de carrito Google:', error);
            }
          }, 1000);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // 🔹 LOGIN CON FUSIÓN AUTOMÁTICA DE CARRITO
      loginWithCartMerge: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.login(email, password);
          const { user, token } = response.data;

          // Guardar token y usuario
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            token,
          });
          localStorage.setItem('token', token);

          // ✅ FUSIONAR CARRITO DESPUÉS DEL LOGIN
          setTimeout(async () => {
            try {
              const cartStore = useCartStore.getState();
              await cartStore.mergeGuestCartWithUser(user.id);
            } catch (error) {
              console.error('Error en fusión de carrito:', error);
            }
          }, 1000);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // 🔹 LOGOUT
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null, // ✅ LIMPIADO
        });
        localStorage.removeItem('token');
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setToken: (token: string) => {
        set({ token });
        localStorage.setItem('token', token);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token, // ✅ PERSISTIDO
      }),
    }
  )
);

/* ==========================
   CART STORE
========================== */
interface CartState {
  items: CartItem[];
  sessionId: string | null;
  isLoading: boolean;
  cart: Cart | null;
  loadCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  setCart: (cart: Cart) => void;
  getTotal: () => number;
  getItemCount: () => number;
  mergeCarts: (userCart: Cart, guestCart: Cart) => Promise<void>;
  // ✅ NUEVO: Fusión automática al login
  mergeGuestCartWithUser: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: null,
      isLoading: false,
      cart: null,

      loadCart: async () => {
        try {
          set({ isLoading: true });
          const sessionId = get().sessionId || generateSessionId();
          const response = await apiClient.getCart(sessionId);
          set({
            cart: response.data || { items: [] },
            sessionId,
          });
        } catch (error) {
          console.error('Error loading cart:', error);
          set({ cart: { items: [] } });
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (product, quantity = 1) => {
        try {
          set({ isLoading: true });
          const sessionId = get().sessionId || generateSessionId();
          await apiClient.addToCart(product.id, quantity, sessionId);
          const cartResponse = await apiClient.getCart(sessionId);
          set({
            cart: cartResponse.data || { items: [] },
            sessionId,
          });
        } catch (error) {
          console.error('Error adding item:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (itemId) => {
        try {
          set({ isLoading: true });
          await apiClient.removeFromCart(itemId);
          const cartResponse = await apiClient.getCart(get().sessionId || undefined);
          set({ cart: cartResponse.data || { items: [] } });
        } catch (error) {
          console.error('Error removing item:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity < 1) {
          await get().removeItem(itemId);
          return;
        }
        try {
          set({ isLoading: true });
          await apiClient.updateCartItem(itemId, quantity);
          const cartResponse = await apiClient.getCart(get().sessionId || undefined);
          set({ cart: cartResponse.data || { items: [] } });
        } catch (error) {
          console.error('Error updating quantity:', error);
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
        return (
          state.cart?.items?.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0
          ) || 0
        );
      },

      getItemCount: () => {
        const state = get();
        return state.cart?.items?.reduce((count, item) => count + item.quantity, 0) || 0;
      },

      mergeCarts: async (userCart, guestCart) => {
        try {
          const sessionId = get().sessionId || generateSessionId();
          for (const guestItem of guestCart.items) {
            const existingItem = userCart.items.find(
              (item) => item.productId === guestItem.productId
            );
            if (existingItem) {
              await apiClient.updateCartItem(
                existingItem.id,
                existingItem.quantity + guestItem.quantity
              );
            } else {
              await apiClient.addToCart(guestItem.productId, guestItem.quantity, sessionId);
            }
          }
          const updatedCart = await apiClient.getCart(sessionId);
          set({ cart: updatedCart.data || { items: [] } });
        } catch (error) {
          console.error('Error merging carts:', error);
          throw error;
        }
      },

      // ✅ NUEVA FUNCIÓN: Fusión automática entre carrito invitado y usuario
      mergeGuestCartWithUser: async (userId: string) => {
        try {
          set({ isLoading: true });

          const sessionId = get().sessionId;
          if (!sessionId) return;

          console.log('🔄 Fusionando carrito guest con usuario:', { sessionId, userId });

          const response = await fetch('http://localhost:5001/api/cart/merge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ sessionId }),
          });

          const result = await response.json();

          if (result.success) {
            console.log('✅ Carrito fusionado exitosamente');
            await get().loadCart();
          } else {
            console.warn('⚠️ No se pudo fusionar carrito:', result.message);
          }
        } catch (error) {
          console.error('❌ Error fusionando carritos:', error);
        } finally {
          set({ isLoading: false });
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
