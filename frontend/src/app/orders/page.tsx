'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order } from '../../types/api.types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
import { Package, Calendar, ArrowRight, CheckCircle, Clock, Truck } from 'lucide-react';
import { apiClient } from '../../types/api';

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendiente' },
  PAID: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Pagado' },
  PROCESSING: { color: 'bg-orange-100 text-orange-800', icon: Package, label: 'Procesando' },
  SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: Truck, label: 'Enviado' },
  DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Entregado' },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: Clock, label: 'Cancelado' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await apiClient.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="bg-gray-300 h-4 rounded w-1/4 mb-2"></div>
              <div className="bg-gray-300 h-4 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aún no tienes pedidos</h3>
            <p className="text-gray-600 mb-6">Cuando realices tu primer pedido, aparecerá aquí.</p>
            <Link href="/products">
              <Button>
                Comenzar a Comprar
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold text-gray-900">Pedido #{order.id.slice(-8)}</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[order.status].label}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString('es-MX')}
                          </div>
                          <div>
                            {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatPrice(order.total)}
                          </div>
                          <div className="text-sm text-gray-600">Total</div>
                        </div>
                        
                        <Link href={`/account/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalles
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }
