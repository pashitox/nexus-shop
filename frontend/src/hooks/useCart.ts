'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '../lib/store';
import { useToast } from './useToast';

export const useCart = () => {
  const { 
    cart, 
    isLoading, 
    addItem, 
    removeItem, 
    updateQuantity, 
    getTotal, 
    getItemCount,
    loadCart 
  } = useCartStore();
  
  const { success, error } = useToast();
  const [isMounted, setIsMounted] = useState(false); // ✅ Nuevo estado

  // ✅ Solo cargar en el cliente
  useEffect(() => {
    setIsMounted(true);
    loadCart();
  }, [loadCart]);

  const handleAddItem = async (product: any, quantity: number = 1) => {
    if (!isMounted) return;
    
    try {
      await addItem(product, quantity);
      success('Producto agregado', `${product.name} agregado al carrito`);
    } catch (err: any) {
      error('Error', err.message || 'No se pudo agregar el producto al carrito');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!isMounted) return;
    
    try {
      await removeItem(itemId);
      success('Producto eliminado', 'Producto removido del carrito');
    } catch (err: any) {
      error('Error', err.message || 'No se pudo eliminar el producto del carrito');
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (!isMounted) return;
    
    try {
      await updateQuantity(itemId, quantity);
    } catch (err: any) {
      error('Error', err.message || 'No se pudo actualizar la cantidad');
    }
  };

  return {
    cart: isMounted ? cart : null,
    isLoading: isMounted ? isLoading : true,
    addItem: handleAddItem,
    removeItem: handleRemoveItem,
    updateQuantity: handleUpdateQuantity,
    getTotal: isMounted ? getTotal : () => 0,
    getItemCount: isMounted ? getItemCount : () => 0,
    items: isMounted ? (cart?.items || []) : []
  };
};