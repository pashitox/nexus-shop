import { Product, Order, Cart, Address } from '@prisma/client';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ProductWithRelations extends Product {
  // Para futuras relaciones
}

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
}

export interface CartItemWithProduct {
  id: string;
  quantity: number;
  product: Product;
}

export interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
}

export interface OrderItemWithProduct {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}
