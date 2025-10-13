// frontend/src/app/checkout/page.tsx - VERSIÓN CORREGIDA
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { CreditCard, Lock, Shield } from "lucide-react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const router = useRouter();

  // ✅ SOLUCIÓN: Cargar localStorage solo en el cliente
  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setSessionId(
      localStorage.getItem("guestSessionId") ||
        `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );
  }, []);

  // ✅ Validación de carrito vacío
  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      setErrorMsg("El carrito está vacío");
    }
  }, [cart]);

  // ✅ Función de checkout con Stripe
  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // Guardar sessionId si es nuevo
      if (!localStorage.getItem("guestSessionId")) {
        localStorage.setItem("guestSessionId", sessionId);
      }

      const checkoutData = {
        sessionId,
        shippingAddress: {
          fullName: "Cliente Ejemplo",
          street: "Calle Principal 123",
          city: "Ciudad de México",
          state: "CDMX",
          postalCode: "12345",
          country: "México",
          phone: "+525512345678",
        },
      };

      const res = await fetch("http://localhost:5001/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error en el checkout");

      console.log("✅ Checkout exitoso:", data);

      // ✅ Redirigir al formulario de pago (Stripe)
      if (data.data && data.data.clientSecret && data.data.orderId) {
        const { clientSecret, orderId, amount } = data.data;
        router.push(
          `/checkout/payment?clientSecret=${clientSecret}&orderId=${orderId}&amount=${amount}`
        );
      } else {
        throw new Error("No se recibió información de pago del servidor");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMsg(err.message || "❌ Error inesperado en el checkout");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cálculos del pedido
  const subtotal =
    cart?.items?.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ) || 0;
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  // ✅ Render principal
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 🧾 Resumen del Pedido */}
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Resumen del Pedido
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              {cart?.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-3 border-b"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}

              <div className="space-y-2 mt-4 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Impuestos (16%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 💳 Información de Pago */}
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Método de Pago
              </h2>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-blue-800 mb-1">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Pago Seguro</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Serás redirigido a Stripe para completar tu compra de forma
                  segura.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800 mb-1">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Protección Total</span>
                </div>
                <p className="text-green-700 text-sm">
                  Tu información de pago está encriptada y nunca toca nuestros
                  servidores.
                </p>
              </div>

              {/* 🔍 Debug Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                <p className="font-semibold mb-1">Debug Info:</p>
                <p>• Items: {cart?.items?.length || 0}</p>
                <p>• SessionId: {sessionId}</p>
                <p>• Usuario: {token ? "Autenticado" : "Invitado"}</p>
              </div>

              {/* ❌ Mensaje de Error */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {errorMsg}
                </div>
              )}

              {/* 🧭 Botón de Pago */}
              <Button
                onClick={handleCheckout}
                disabled={loading || !cart || cart.items.length === 0}
                className="w-full py-3 text-lg font-semibold mt-3"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  `Pagar ${formatPrice(total)}`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}