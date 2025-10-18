// frontend/src/app/orders/page.tsx - VERSIÓN PROFESIONAL
"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/types/api";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    product: {
      name: string;
      price: number;
      image?: string;
    };
    quantity: number;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log('🔄 Cargando órdenes...');
      
      // Verificar autenticación
      try {
        const authTest = await apiClient.testAuth();
        console.log('✅ Autenticación verificada:', authTest.data.user.email);
      } catch (authError) {
        console.error('❌ Error de autenticación:', authError);
        setError('Error de autenticación. Por favor inicia sesión nuevamente.');
        return;
      }
      
      // Cargar órdenes
      const response = await apiClient.getOrders();
      console.log('📦 Órdenes cargadas:', response.data.length);
      setOrders(response.data || []);
      
    } catch (err: any) {
      console.error("❌ Error cargando órdenes:", err);
      setError(err.message || "Error al cargar las órdenes");
    } finally {
      setLoading(false);
    }
  };

  const retryWithFreshToken = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.reload();
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener color del estado
  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
      'PAID': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
      'PROCESSING': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
      'SHIPPED': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
      'DELIVERED': { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
      'CANCELLED': { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' }
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  // Función para traducir estado
  const translateStatus = (status: string) => {
    const translations: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'PAID': 'Pagado',
      'PROCESSING': 'Procesando',
      'SHIPPED': 'Enviado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return translations[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
            <p className="text-gray-600">Gestiona y revisa tu historial de compras</p>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Cargando tus pedidos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
            <p className="text-gray-600">Gestiona y revisa tu historial de compras</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error al cargar pedidos</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={loadOrders}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Reintentar
              </button>
              <button 
                onClick={retryWithFreshToken}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Limpiar Sesión
              </button>
              <a 
                href="/login"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
              >
                Iniciar Sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Mis Pedidos</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Revisa el estado y detalles de todas tus compras realizadas en NexusShop
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📦</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No hay pedidos</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Aún no has realizado ninguna compra en nuestra tienda. Descubre nuestros productos y realiza tu primer pedido.
            </p>
            <a 
              href="/products" 
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:shadow-lg"
            >
              <span>Explorar Productos</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Estadísticas rápidas */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-wrap gap-6 justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                  <div className="text-gray-600 text-sm">Total de Pedidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    ${orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-600 text-sm">Total Gastado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {orders.filter(o => o.status === 'PENDING').length}
                  </div>
                  <div className="text-gray-600 text-sm">Pendientes</div>
                </div>
              </div>
            </div>

            {/* Lista de órdenes */}
            {orders.map((order) => {
              const statusColor = getStatusColor(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                  
                  {/* Header de la orden */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Orden #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="text-2xl font-bold text-gray-900">
                          ${order.total.toLocaleString()}
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text} ${statusColor.border} border`}>
                          {translateStatus(order.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Productos */}
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Productos ({order.items.length})
                    </h4>
                    
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {item.quantity}x
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-gray-600 text-sm">${item.product.price.toLocaleString()} c/u</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ${(item.product.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer de la orden */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        ID: {order.id}
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                        Ver detalles completos
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer informativo */}
        {orders.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              ¿Necesitas ayuda con algún pedido?{" "}
              <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                Contáctanos
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}