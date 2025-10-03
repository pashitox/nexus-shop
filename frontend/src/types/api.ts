import { Product, User, Cart, Order, Address } from './api.types';

const BASE_URL = 'http://localhost:5001/api';

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error en la API');
  return data;
};

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        return authData.state?.token || null;
      } catch (error) {
        console.error('Error parsing auth storage:', error);
        return null;
      }
    }
  }
  return null;
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
    const token = getToken();
    const res = await fetch(`${BASE_URL}/orders`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return handleResponse(res);
  },

  getOrder: async (id: string) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return handleResponse(res);
  },

  createOrder: async (orderData: any) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
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
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  // 🏠 Direcciones
  getAddresses: async () => {
    const token = getToken();
    if (!token) throw new Error('No token available');

    const res = await fetch(`${BASE_URL}/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
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
        Authorization: `Bearer ${token}`,
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
        Authorization: `Bearer ${token}`,
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
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  setDefaultAddress: async (id: string) => {
    const token = getToken();
    if (!token) throw new Error('No token available');

    const res = await fetch(`${BASE_URL}/addresses/${id}/default`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
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
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return handleResponse(res);
  },

  addToCart: async (productId: string, quantity: number, sessionId?: string) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
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
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ quantity }),
    });
    return handleResponse(res);
  },

  removeFromCart: async (itemId: string) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/cart/${itemId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return handleResponse(res);
  },
};
