export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string; 
  token?: string; // 🔥 agregado para auth
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
}

export interface CartItem {
  id: string; 
  product: Product;
  productId: string; 
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  guestEmail?: string; 
  user?: { 
    email: string;
  };
}

export interface OrderItem {
  id: string; 
  product: Product;
  quantity: number;
  price: number;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  fullName: string; 
  postalCode: string; 
  phone?: string; 
}

export type OrderStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED';
