// frontend/src/app/checkout/page.tsx - VERSIÓN FINAL FUNCIONAL
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

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg("");
    
    try {
      const token = localStorage.getItem("token");

      // ✅ RUTA CORREGIDA: /api/payments/checkout
      const res = await fetch("http://localhost:5001/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ 
          sessionId,
          shippingAddress: {
            fullName: "Cliente Ejemplo",
            street: "Calle Principal 123",
            city: "Ciudad de México",
            state: "CDMX", 
            postalCode: "12345",
            country: "México",
            phone: "+525512345678"
          }
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error en el checkout");
      }

      console.log("✅ Checkout exitoso:", data);

      // Si tenemos clientSecret, redirigir a éxito
      if (data.data && data.data.orderId) {
        // Limpiar carrito después de checkout exitoso
        clearCart();
        
        // Redirigir a página de éxito con el orderId
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

  const total = cart?.items?.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0) || 0;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Resumen del Pedido */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
        
        {cart?.items?.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-gray-600">Cantidad: {item.quantity}</p>
            </div>
            <p className="font-semibold">
              ${(item.product.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
        
        <div className="flex justify-between items-center pt-4 mt-4 border-t">
          <p className="text-lg font-bold">Total:</p>
          <p className="text-lg font-bold">${total.toFixed(2)}</p>
        </div>
      </div>

      {/* Mensaje de Error */}
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMsg}
        </div>
      )}

      {/* Botón de Pago */}
      <button
        onClick={handleCheckout}
        disabled={loading || !cart || cart.items.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
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
  );
}