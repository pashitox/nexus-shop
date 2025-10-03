export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
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
  product: Product;
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
}

export interface OrderItem {
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
}

export type OrderStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED';