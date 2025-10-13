// frontend/src/app/checkout/success/page.tsx - VERSIÓN CORREGIDA
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
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  // ✅ SOLUCIÓN: Cargar token solo en el cliente
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchOrder = async () => {
      try {
        if (orderId) {
          const res = await fetch(`http://localhost:5001/api/orders/${orderId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Error al obtener la orden");

          if (data.data) {
            setOrder(data.data);
          } else {
            await fetchLatestOrder();
          }
        } else {
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
        const res = await fetch("http://localhost:5001/api/orders", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al obtener las órdenes");

        if (data.data && data.data.length > 0) {
          // Tomar la orden más reciente
          setOrder(data.data[0]);
        } else {
          setErrorMsg("No se encontraron órdenes recientes");
        }
      } catch (err: any) {
        console.error("Error obteniendo órdenes:", err);
        setErrorMsg(err.message || "❌ Error al cargar las órdenes.");
      }
    };

    fetchOrder();
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-700 font-medium">Procesando tu pedido...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        {/* Header de Éxito */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600 text-sm">
            Tu pedido ha sido procesado correctamente.
          </p>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && !order && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-5 py-3 rounded-lg mb-6 text-center">
            <p>{errorMsg}</p>
            <Link href="/orders" className="text-blue-600 hover:underline mt-2 inline-block font-medium">
              Ver mis órdenes
            </Link>
          </div>
        )}

        {/* Detalles de la Orden */}
        {order && (
          <div className="rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Detalles de tu Orden
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-800">
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
                <p className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString("es-MX")}
                </p>
              </div>
            </div>

            {/* Items */}
            <h3 className="font-semibold text-gray-900 mb-3 border-b pb-1">Productos</h3>
            <div className="space-y-2 text-gray-800">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.name} × {item.quantity}</span>
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl text-center shadow-md transition-all duration-300"
          >
            Seguir Comprando
          </Link>

          <Link
            href="/orders"
            className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl text-center shadow-md transition-all duration-300"
          >
            Ver Mis Órdenes
          </Link>
        </div>

        {/* Mensaje Final */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Gracias por tu compra. Te hemos enviado un correo de confirmación.
          </p>
        </div>
      </div>
    </div>
  );
}