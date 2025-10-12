"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, sessionId, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      setErrorMsg("El carrito está vacío");
    }
  }, [cart]);

  const getSessionId = () => {
    const guestSessionId = typeof window !== "undefined" ? localStorage.getItem("guestSessionId") : null;
    if (guestSessionId) return guestSessionId;
    return `session_${Date.now()}`;
  };

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const sid = getSessionId();

      const res = await fetch("http://localhost:5001/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sessionId: sid,
          shippingAddress: {
            fullName: "Cliente Ejemplo",
            street: "Calle Principal 123",
            city: "Ciudad de México",
            state: "CDMX",
            postalCode: "12345",
            country: "México",
            phone: "+525512345678",
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error en el checkout");

      if (data.data && data.data.orderId) {
        clearCart();
        router.push(`/checkout/success?orderId=${data.data.orderId}`);
      } else {
        throw new Error("No se recibió orderId del servidor");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMsg(err.message || "❌ Error inesperado en el checkout");
    } finally {
      setLoading(false);
    }
  };

  const total =
    cart?.items?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Checkout
        </h1>

        {/* Resumen del Pedido */}
        <div className="rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">
            Resumen del Pedido
          </h2>
          {cart?.items?.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-3 border-b last:border-b-0"
            >
              <div>
                <p className="font-medium text-gray-900">{item.product.name}</p>
                <p className="text-gray-600 text-sm">Cantidad: {item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-900">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4 mt-4 border-t">
            <p className="text-lg font-bold text-gray-900">Total:</p>
            <p className="text-lg font-bold text-gray-900">${total.toFixed(2)}</p>
          </div>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg mb-5 text-center">
            {errorMsg}
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 text-gray-800 text-sm">
          <p>
            <strong className="text-gray-900">Debug Info:</strong><br />
            • Items en carrito: {cart?.items?.length || 0}<br />
            • SessionId: {getSessionId()}<br />
            • Usuario: {typeof window !== "undefined" && localStorage.getItem("token") ? "Autenticado" : "Invitado"}
          </p>
        </div>

        {/* Botón de Pago */}
        <button
          onClick={handleCheckout}
          disabled={loading || !cart || cart.items.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Procesando Pago...
            </div>
          ) : (
            `Pagar $${total.toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  );
}
