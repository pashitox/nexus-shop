// frontend/src/app/checkout/page.tsx - VERSIÓN FINAL CORREGIDA
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { CreditCard, Lock, Shield, ShoppingCart, LogIn } from "lucide-react";

export default function CheckoutPage() {
  const { cart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ VERIFICAR SI EL USUARIO ESTÁ LOGUEADO
  useEffect(() => {
    const userToken = localStorage.getItem("token");
    setToken(userToken);
    
    // ✅ OBTENER SESSION ID DEL LOCALSTORAGE
    const guestSession = localStorage.getItem("guestSessionId") || "guest_default_session";
    setSessionId(guestSession);

    // ✅ REDIRIGIR SI NO ESTÁ LOGUEADO - USANDO RUTA CORRECTA /login
    if (!userToken) {
      console.log("🔐 Usuario no logueado - Redirigiendo a /login");
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [router]);

  // ✅ SI NO HAY TOKEN, MOSTRAR PANTALLA DE LOGIN
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-16">
            <LogIn className="w-24 h-24 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Inicia Sesión para Continuar
            </h1>
            <p className="text-gray-600 mb-6">
              Necesitas tener una cuenta para completar tu compra.
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              <Button 
                onClick={() => router.push("/login?redirect=/checkout")}
                className="w-full py-3"
              >
                Iniciar Sesión
              </Button>
              <Button 
                onClick={() => router.push("/register?redirect=/checkout")}
                variant="outline"
                className="w-full py-3"
              >
                Crear Cuenta
              </Button>
              <Button 
                onClick={() => router.push("/products")}
                variant="ghost"
                className="w-full py-2"
              >
                Continuar Comprando
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Función de checkout
  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error("El carrito está vacío");
      }

      console.log("🛒 Enviando checkout como usuario autenticado:", {
        sessionId,
        itemsCount: cart.items.length,
        usuario: "Autenticado"
      });

      const checkoutData = {
        sessionId: sessionId,
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error("❌ Error del backend:", data);
        throw new Error(data.message || "Error en el checkout");
      }

      console.log("✅ Checkout exitoso:", data);

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
  const subtotal = cart?.items?.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0;
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  // ✅ Si el carrito está vacío
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Carrito Vacío
            </h1>
            <p className="text-gray-600 mb-8">
              Agrega productos al carrito antes de proceder al checkout.
            </p>
            <Button onClick={() => router.push("/products")}>
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Render principal (SOLO PARA USUARIOS LOGUEADOS)
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
              {cart.items.map((item) => (
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
                  Serás redirigido a Stripe para completar tu compra de forma segura.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800 mb-1">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Protección Total</span>
                </div>
                <p className="text-green-700 text-sm">
                  Tu información de pago está encriptada y nunca toca nuestros servidores.
                </p>
              </div>

              {/* 🔍 Información del Usuario */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="font-semibold text-green-800 mb-1">✅ Usuario Verificado</p>
                <p className="text-green-700 text-sm">
                  Has iniciado sesión correctamente. Tu pedido se asociará a tu cuenta.
                </p>
              </div>

              {/* 🔍 Información del Pedido */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                <p className="font-semibold mb-1">Información del Pedido:</p>
                <p>• Items: {cart.items.length}</p>
                <p>• Usuario: Autenticado ✅</p>
                <p>• Total: {formatPrice(total)}</p>
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
                disabled={loading}
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