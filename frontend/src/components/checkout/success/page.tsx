'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Order } from '../../../types/api.types';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { formatPrice } from '../../../lib/utils';
import { CheckCircle, Package, Mail, Home, ArrowRight } from 'lucide-react';
import { apiClient } from '../../../types/api';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const orderData = await apiClient.getOrder(orderId!);
      setOrder(orderData.data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-pulse">
          <div className="bg-gray-300 w-16 h-16 rounded-full mx-auto mb-4"></div>
          <div className="bg-gray-300 h-6 rounded w-1/3 mx-auto mb-4"></div>
          <div className="bg-gray-300 h-4 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Orden no encontrada</h1>
        <Link href="/">
          <Button>Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
        <p className="text-gray-600">
          Gracias por tu compra. Hemos enviado los detalles a {order.guestEmail || order.user?.email}
        </p>
        <div className="bg-gray-100 inline-block px-3 py-1 rounded-full text-sm font-medium mt-4">
          Orden #${order.id.slice(-8).toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Order Summary */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Resumen del Pedido
            </h2>
            
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-gray-600 text-sm">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="text-green-600">Gratis</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(order.total * 1.16)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Info */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Dirección de Envío
            </h2>
            
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p>Tel: {order.shippingAddress.phone}</p>}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Enviaremos una confirmación por email cuando el pedido sea enviado.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">¿Qué sigue?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-medium mb-1">Preparando tu pedido</h3>
              <p className="text-sm text-gray-600">Procesaremos tu pedido en las próximas 24 horas</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">🚚</span>
              </div>
              <h3 className="font-medium mb-1">En camino</h3>
              <p className="text-sm text-gray-600">Recibirás un email con el número de seguimiento</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-1">¡Recibido!</h3>
              <p className="text-sm text-gray-600">Tu pedido llegará en 3-5 días hábiles</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Link href="/account/orders" className="flex-1 sm:flex-none">
          <Button className="w-full">
            Ver Mis Pedidos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        
        <Link href="/products" className="flex-1 sm:flex-none">
          <Button variant="outline" className="w-full">
            Seguir Comprando
          </Button>
        </Link>
      </div>
    </div>
  );
}