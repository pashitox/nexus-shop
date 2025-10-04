'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader } from 'lucide-react';

export default function CartPage() {
  const { 
    cart, 
    isLoading, 
    removeItem, 
    updateQuantity, 
    getTotal, 
    getItemCount,
    items 
  } = useCart();

  // ✅ SOLUCIÓN: Estado para prevenir hydration errors
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  // ✅ No renderizar hasta que esté montado en el cliente
  if (!isMounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Loader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Cargando carrito...</h1>
      </div>
    );
  }

  if (isLoading && !cart) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Loader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Cargando carrito...</h1>
      </div>
    );
  }

  if (!cart || items.length === 0) {
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

  const subtotal = getTotal();
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* TÍTULO EN BLANCO - Necesita fondo oscuro para verse */}
      <div className="bg-gray-900 rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-white">Carrito de Compras</h1>
        <p className="text-gray-300 mt-2">{getItemCount()} productos en tu carrito</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
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
                        disabled={isLoading}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      >
                        {isLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
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
                        <span className="text-sm text-gray-500">
                          Total: {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isLoading}
                          className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-primary-500 disabled:opacity-50 shadow-sm transition-all duration-200"
                        >
                          <Minus className="w-3 h-3 text-gray-700" />
                        </button>
                        
                        <span className="w-8 text-center font-medium text-gray-900 text-sm">
                          {isLoading ? (
                            <Loader className="w-3 h-3 animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock || isLoading}
                          className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-primary-500 disabled:opacity-50 shadow-sm transition-all duration-200"
                        >
                          <Plus className="w-3 h-3 text-gray-700" />
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

                    {/* Botón eliminar más visible */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isLoading}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span>Eliminar producto</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary - COLORES NEGROS */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="bg-gray-800 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Resumen del Pedido</h3>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Subtotal ({getItemCount()} items)</span>
                <span className="text-white font-medium">{formatPrice(subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Envío</span>
                <span className="text-green-400 font-medium">Gratis</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Impuestos (16%)</span>
                <span className="text-white font-medium">{formatPrice(tax)}</span>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between text-lg">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-white font-bold">{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button 
                  className="w-full bg-white text-gray-900 hover:bg-gray-100 border-0 font-semibold" 
                  size="lg"
                  disabled={isLoading || items.length === 0}
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Proceder al Pago
                </Button>
              </Link>

              <Link href="/products">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  disabled={isLoading}
                >
                  Continuar Comprando
                </Button>
              </Link>

              <div className="text-xs text-gray-400 text-center">
                <p>¿Necesitas ayuda? <Link href="/contact" className="text-primary-400 hover:text-primary-300">Contáctanos</Link></p>
              </div>
            </CardContent>
          </Card>

          {/* Security Badges */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center">
            <div className="flex justify-center space-x-6 mb-3">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-green-400 text-lg">✓</span>
                </div>
                <span className="text-xs text-gray-300">Pago seguro</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-blue-400 text-lg">🚚</span>
                </div>
                <span className="text-xs text-gray-300">Envío gratis</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-orange-400 text-lg">↻</span>
                </div>
                <span className="text-xs text-gray-300">Devoluciones</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}