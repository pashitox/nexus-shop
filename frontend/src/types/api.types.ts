// Tipos para la API de NexusShop

// ----------------------
// Usuario
// ----------------------
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: string;
}

// Resumen de usuario opcional para pedidos
export interface UserSummary {
  id: string;
  email: string;
  name?: string | null;
}

// ----------------------
// Productos
// ----------------------
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string;
  stock: number;
  category: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------------
// Carrito
// ----------------------
export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// ----------------------
// Ordenes
// ----------------------
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  userId: string | null;
  guestEmail: string | null;
  guestName: string | null;
  shippingAddress: any;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  items: OrderItem[];
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;

  // Propiedad opcional para pedidos de usuario registrado
  user?: UserSummary;
}

// ----------------------
// Direcciones
// ----------------------
export interface Address {
  id: string;
  userId: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
}

// ----------------------
// Respuestas de la API
// ----------------------
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
