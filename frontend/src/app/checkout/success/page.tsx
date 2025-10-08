// frontend/src/app/checkout/success/page.tsx - VERSIÓN MEJORADA
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      name: string;
      price: number;
    };
  }>;
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Si tenemos orderId en la URL, buscar esa orden específica
        if (orderId) {
          const token = localStorage.getItem("token");
          
          const res = await fetch(`http://localhost:5001/api/payments/order-status/${orderId}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Error al obtener la orden");
          }

          if (data.data && data.data.order) {
            setOrder(data.data.order);
          } else {
            // Si no encontramos por orderId, intentar con la última orden
            await fetchLatestOrder();
          }
        } else {
          // Si no hay orderId, buscar la última orden
          await fetchLatestOrder();
        }

      } catch (err: any) {
        console.error("Error obteniendo orden:", err);
        setErrorMsg(err.message || "❌ Error al cargar los detalles de la orden.");
      } finally {
        setLoading(false);
      }
    };

    const fetchLatestOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          setErrorMsg("Necesitas iniciar sesión para ver los detalles de la orden");
          return;
        }

        const res = await fetch("http://localhost:5001/api/payments/latest-order", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Error al obtener la última orden");
        }

        if (data.data && data.data.order) {
          setOrder(data.data.order);
        } else {
          setErrorMsg("No se encontraron órdenes recientes");
        }
      } catch (err: any) {
        console.error("Error obteniendo última orden:", err);
        setErrorMsg(err.message || "❌ Error al cargar la última orden.");
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg">Procesando tu pedido...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header de Éxito */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">¡Pago Exitoso!</h1>
          <p className="text-gray-600">Tu pedido ha sido procesado correctamente.</p>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && !order && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p>{errorMsg}</p>
            <Link href="/orders" className="text-blue-600 hover:underline mt-2 inline-block">
              Ver mis órdenes
            </Link>
          </div>
        )}

        {/* Detalles de la Orden */}
        {order && (
          <div className="border rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Detalles de tu Orden</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600">Número de Orden</p>
                <p className="font-semibold">#{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-600">Estado</p>
                <p className="font-semibold capitalize">{order.status.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-gray-600">Total</p>
                <p className="font-semibold">${order.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Fecha</p>
                <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Items de la Orden */}
            <h3 className="font-semibold mb-2">Productos:</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/products"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center transition duration-200"
          >
            Seguir Comprando
          </Link>
          
          <Link 
            href="/orders"
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-center transition duration-200"
          >
            Ver Mis Órdenes
          </Link>
        </div>

        {/* Mensaje de Agradecimiento */}
        <div className="text-center mt-6 pt-6 border-t">
          <p className="text-gray-600">
            Gracias por tu compra. Te hemos enviado un email de confirmación.
          </p>
        </div>
      </div>
    </div>
  );
}