'use client';

import Link from 'next/link';
import { useCartStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { formatPrice } from '../../lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, getTotal, getItemCount } = useCartStore();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    // Cargar carrito desde la API si es necesario
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setIsUpdating(itemId);
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-600 mb-8">Agrega algunos productos increíbles para comenzar</p>
        <Link href="/products">
          <Button size="lg">
            Continuar Comprando
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Product Image */}
                  <div className="sm:w-32 sm:h-32 w-full h-48 bg-gray-100 flex-shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Link 
                        href={`/products/${item.product.id}`}
                        className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating === item.id}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.product.price)}
                        </span>
                        {item.product.price * 1.2 > item.product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(item.product.price * 1.2)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating === item.id}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        
                        <span className="w-8 text-center font-medium">
                          {isUpdating === item.id ? '...' : item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock || isUpdating === item.id}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Stock Info */}
                    <div className="mt-2 text-sm text-gray-600">
                      {item.product.stock > 0 ? (
                        <span className="text-green-600">
                          En stock ({item.product.stock} disponibles)
                        </span>
                      ) : (
                        <span className="text-red-600">Agotado</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Resumen del Pedido</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({getItemCount()} items)</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span className="text-green-600">Gratis</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Impuestos</span>
                <span>{formatPrice(getTotal() * 0.16)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(getTotal() * 1.16)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Proceder al Pago
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="outline" className="w-full">
                  Continuar Comprando
                </Button>
              </Link>

              <div className="text-xs text-gray-500 text-center">
                <p>¿Necesitas ayuda? <Link href="/contact" className="text-primary-600">Contáctanos</Link></p>
              </div>
            </CardContent>
          </Card>

          {/* Security Badges */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <div className="flex justify-center space-x-6 mb-3">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
                <span className="text-xs text-gray-600">Pago seguro</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-blue-600 text-lg">🚚</span>
                </div>
                <span className="text-xs text-gray-600">Envío gratis</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-orange-600 text-lg">↻</span>
                </div>
                <span className="text-xs text-gray-600">Devoluciones</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}