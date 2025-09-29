import { ApiResponse, AuthResponse, Product, Cart, Order, Address } from '../types/api.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Agregar token de autenticación si existe
    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Auth endpoints
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile(): Promise<any> {
    return this.request<any>('/auth/profile');
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // Product endpoints
  async getProducts(params?: { category?: string; search?: string; page?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return this.request<any>(endpoint);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  // Cart endpoints
  async getCart(sessionId?: string): Promise<Cart> {
    const endpoint = sessionId ? `/cart?sessionId=${sessionId}` : '/cart';
    return this.request<Cart>(endpoint);
  }

  async addToCart(productId: string, quantity: number, sessionId?: string): Promise<any> {
    return this.request<any>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, sessionId }),
    });
  }

  async updateCartItem(itemId: string, quantity: number): Promise<void> {
    return this.request<void>(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string): Promise<void> {
    return this.request<void>(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async createOrder(orderData: any): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  // Address endpoints
  async getAddresses(): Promise<Address[]> {
    return this.request<Address[]>('/addresses');
  }

  async createAddress(addressData: Omit<Address, 'id' | 'userId' | 'createdAt'>): Promise<Address> {
    return this.request<Address>('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }
}

export const apiClient = new ApiClient();