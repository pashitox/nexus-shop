// frontend/src/app/orders/page.tsx - VERSIÓN CORREGIDA
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
      
      // Primero probar autenticación
      try {
        const authTest = await apiClient.testAuth();
        console.log('✅ Autenticación verificada:', authTest.data.user.email);
      } catch (authError) {
        console.error('❌ Error de autenticación:', authError);
        setError('Error de autenticación. Por favor inicia sesión nuevamente.');
        return;
      }
      
      // Luego cargar órdenes
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
    // Limpiar token y recargar
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Mis Órdenes</h1>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Cargando órdenes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Mis Órdenes</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error al cargar órdenes:</p>
          <p className="mt-2">{error}</p>
          <div className="mt-4 space-x-2">
            <button 
              onClick={loadOrders}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Reintentar
            </button>
            <button 
              onClick={retryWithFreshToken}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Limpiar Sesión
            </button>
            <a 
              href="/login"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Ir al Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mis Órdenes</h1>
      
      {orders.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No hay órdenes</h2>
          <p className="text-gray-600 mb-4">Aún no has realizado ninguna compra.</p>
          <a 
            href="/products" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Comprar Productos
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Orden #{order.id.slice(-8)}</h3>
                  <p className="text-gray-600 text-sm">
                    {new Date(order.createdAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${order.total.toFixed(2)}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Productos:</h4>
                <ul className="space-y-1">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}