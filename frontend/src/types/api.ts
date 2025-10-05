import { Product, User, Cart, Order, Address } from './api.types';

const BASE_URL = 'http://localhost:5001/api';

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error en la API');
  return data;
};

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    // ✅ BUSCAR PRIMERO EN ZUSTAND STORAGE
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      
      // ✅ MULTIPLES ESTRUCTURAS POSIBLES
      const token = 
        parsed?.state?.token ||        // Zustand persist estándar
        parsed?.token ||               // Estructura simple
        parsed?.user?.token;           // Token en user object
      
      if (token && typeof token === 'string') {
        console.log('Token encontrado en auth-storage:', token.substring(0, 20) + '...');
        return token;
      }
    }

    // ✅ BUSCAR EN LOCALSTORAGE LEGACY
    const legacyToken = localStorage.getItem('token');
    if (legacyToken) {
      console.log('Token encontrado en localStorage legacy');
      return legacyToken;
    }

    console.log('No se encontró token');
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// ✅ FUNCIÓN PARA DEBUG
const debugToken = () => {
  const token = getToken();
  console.log('🔐 Token debug:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? token.substring(0, 20) + '...' : null,
    authStorage: localStorage.getItem('auth-storage') ? 'EXISTS' : 'MISSING',
    legacyToken: localStorage.getItem('token') ? 'EXISTS' : 'MISSING'
  });
  return token;
};

export const apiClient = {
  // 🛍 Productos
  getProducts: async () => {
    const res = await fetch(`${BASE_URL}/products`);
    return handleResponse(res);
  },

  getProduct: async (id: string) => {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    return handleResponse(res);
  },

  // 📦 Órdenes
  getOrders: async () => {
    const token = debugToken(); // ✅ Usar debug para ver qué pasa
    if (!token) throw new Error('No token available');

    console.log('🔐 Enviando token en request:', token.substring(0, 20) + '...');
    
    const res = await fetch(`${BASE_URL}/orders`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(res);
  },

  getOrder: async (id: string) => {
    const token = getToken();
    if (!token) throw new Error('No token available');

    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(res);
  },

  createOrder: async (orderData: any) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  // 🔐 Autenticación
  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  register: async (email: string, password: string, name: string) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return handleResponse(res);
  },

  getProfile: async () => {
    const token = getToken();
    if (!token) throw new Error('No token available');

    const res = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(res);
  },

  googleLogin: async (token: string) => {
    const response = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    return handleResponse(response);
  },

  // 🏠 Direcciones
  getAddresses: async () => {
    const token = getToken();
    if (!token) throw new Error('No token available');

    const res = await fetch(`${BASE_URL}/addresses`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(res);
  },

  createAddress: async (addressData: Omit<Address, 'id'>) => {
    const token = getToken();
    if (!token) throw new Error('No token available');

    const res = await fetch(`${BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });
    return handleResponse(res);
  },

  updateAddress: async (id: string, addressData: Omit<Address, 'id'>) => {
    const token = getToken();
    if (!token) throw new Error('No token available');

    const res = await fetch(`${BASE_URL}/addresses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });
    return handleResponse(res);
  },

  deleteAddress: async (id: string) => {
    const token = getToken();
    if (!token) throw new Error('No token available');

    const res = await fetch(`${BASE_URL}/addresses/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(res);
  },

  setDefaultAddress: async (id: string) => {
    const token = getToken();
    if (!token) throw new Error('No token available');

    const res = await fetch(`${BASE_URL}/addresses/${id}/default`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return handleResponse(res);
  },

  // 🛒 Carrito
  getCart: async (sessionId?: string) => {
    const token = getToken();
    const url = sessionId
      ? `${BASE_URL}/cart?sessionId=${sessionId}`
      : `${BASE_URL}/cart`;

    const res = await fetch(url, {
      method: 'GET',
      headers: token ? { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {},
    });
    return handleResponse(res);
  },

  addToCart: async (productId: string, quantity: number, sessionId?: string) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ productId, quantity, sessionId }),
    });
    return handleResponse(res);
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/cart/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ quantity }),
    });
    return handleResponse(res);
  },

  removeFromCart: async (itemId: string) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/cart/${itemId}`, {
      method: 'DELETE',
      headers: token ? { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {},
    });
    return handleResponse(res);
  },
};