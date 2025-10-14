// frontend/src/app/checkout/page.tsx - VERSIÓN CORREGIDA
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { CreditCard, Lock, Shield, ShoppingCart, LogIn, MapPin, Plus, Loader } from "lucide-react";

// ✅ Interfaz para dirección
interface Address {
  id: string;
  userId: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
}

// ✅ Función para obtener el email del token
const getUserEmailFromToken = (): string => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || "";
    }
  } catch (error) {
    console.error("Error obteniendo email del token:", error);
  }
  return "";
};

export default function CheckoutPage() {
  const { cart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true); // ✅ Iniciar como true
  const router = useRouter();

  // ✅ VERIFICAR SI EL USUARIO ESTÁ LOGUEADO Y CARGAR DIRECCIONES
  useEffect(() => {
    const userToken = localStorage.getItem("token");
    setToken(userToken);
    
    // ✅ OBTENER EMAIL DEL USUARIO DEL TOKEN
    if (userToken) {
      const email = getUserEmailFromToken();
      setUserEmail(email);
      console.log("📧 Email del usuario:", email);
    }
    
    const guestSession = localStorage.getItem("guestSessionId") || "guest_default_session";
    setSessionId(guestSession);

    if (!userToken) {
      console.log("🔐 Usuario no logueado - Redirigiendo a /login");
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
    }
  }, [router]);

  // ✅ CARGAR DIRECCIONES DEL USUARIO - EFFECT SEPARADO
  useEffect(() => {
    if (!token) return;
    
    loadUserAddresses();
  }, [token]); // ✅ Solo ejecutar cuando token cambie

  // ✅ CARGAR DIRECCIONES DEL USUARIO
  const loadUserAddresses = async () => {
    if (!token) {
      setAddressLoading(false);
      return;
    }
    
    setAddressLoading(true);
    try {
      console.log("📍 Cargando direcciones para usuario...");
      const res = await fetch("http://localhost:5001/api/addresses", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      console.log("📍 Respuesta del servidor:", res.status, res.statusText);

      if (res.ok) {
        const data = await res.json();
        console.log("📍 Direcciones cargadas:", data);
        
        // ✅ VERIFICAR ESTRUCTURA DE LA RESPUESTA
        const addresses = data.data || data.addresses || data || [];
        setUserAddresses(addresses);
        
        console.log("📍 Direcciones procesadas:", addresses);

        // ✅ SELECCIONAR DIRECCIÓN POR DEFECTO O LA PRIMERA
        if (addresses.length > 0) {
          const defaultAddress = addresses.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
            console.log("📍 Dirección predeterminada seleccionada:", defaultAddress);
          } else {
            setSelectedAddress(addresses[0]);
            console.log("📍 Primera dirección seleccionada:", addresses[0]);
          }
        } else {
          console.log("📍 No hay direcciones disponibles");
          setSelectedAddress(null);
        }
      } else {
        const errorText = await res.text();
        console.error("❌ Error cargando direcciones:", res.status, errorText);
        setUserAddresses([]);
      }
    } catch (error) {
      console.error("❌ Error cargando direcciones:", error);
      setUserAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  };

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

  // ✅ SI ESTÁ CARGANDO, MOSTRAR LOADING
  if (addressLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-16">
            <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Cargando...
            </h1>
            <p className="text-gray-600">
              Cargando tus direcciones de envío
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ SI NO HAY DIRECCIONES, MOSTRAR FORMULARIO
  if (userAddresses.length === 0 && !showAddressForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center py-8">
            <MapPin className="w-20 h-20 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Agrega tu Dirección de Envío
            </h1>
            <p className="text-gray-600 mb-8">
              Necesitamos saber dónde enviar tu pedido antes de continuar.
            </p>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-6">
                    No tienes direcciones guardadas. Por favor agrega una dirección de envío.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Agregar Dirección</span>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={loadUserAddresses}
                      className="flex items-center space-x-2 mx-auto"
                    >
                      <Loader className="w-4 h-4" />
                      <span>Reintentar Cargar Direcciones</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ✅ FORMULARIO DE DIRECCIÓN
  if (showAddressForm) {
    return (
      <AddressForm 
        onSave={(address) => {
          setUserAddresses([...userAddresses, address]);
          setSelectedAddress(address);
          setShowAddressForm(false);
          // ✅ RECARGAR DIRECCIONES DESPUÉS DE GUARDAR
          setTimeout(() => loadUserAddresses(), 500);
        }}
        onCancel={() => setShowAddressForm(false)}
        token={token}
      />
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

      if (!selectedAddress) {
        throw new Error("Por favor selecciona una dirección de envío");
      }

      console.log("🛒 Enviando checkout con dirección:", selectedAddress);
      console.log("📧 Email del usuario:", userEmail);

      // ✅ FORMATO EXACTO QUE ESPERA EL BACKEND - CON EMAIL DEL USUARIO
      const checkoutData = {
        sessionId: sessionId,
        shippingAddress: {
          fullName: selectedAddress.fullName,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country,
          phone: selectedAddress.phone,
        },
        guestEmail: userEmail
      };

      console.log("📦 Datos enviados al checkout:", checkoutData);

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
        console.error("❌ Error completo del backend:", data);
        
        if (data.errors && data.errors.length > 0) {
          const errorDetails = data.errors.map((err: any) => 
            `${err.path}: ${err.message}`
          ).join(', ');
          throw new Error(`Errores de validación: ${errorDetails}`);
        }
        
        throw new Error(data.message || `Error en el checkout: ${res.status}`);
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

  // ✅ Render principal
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Checkout
        </h1>

        {/* 🔧 DEBUG INFO */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Debug Info:</strong> Direcciones cargadas: {userAddresses.length} | 
            Token: {token ? "✅" : "❌"} | 
            Email: {userEmail || "No disponible"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 🧾 Resumen del Pedido Y DIRECCIÓN */}
          <div className="space-y-6">
            {/* Selección de Dirección */}
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Dirección de Envío ({userAddresses.length})
                </h2>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Lista de direcciones */}
                  {userAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAddress?.id === address.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{address.fullName}</p>
                          <p className="text-gray-900 text-sm mt-1">{address.street}</p>
                          <p className="text-gray-900 text-sm">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-gray-900 text-sm">{address.country}</p>
                          <p className="text-gray-900 text-sm mt-1">{address.phone}</p>
                        </div>
                        {selectedAddress?.id === address.id && (
                          <div className="bg-blue-500 text-white rounded-full p-1 ml-2 flex-shrink-0">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      {address.isDefault && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Predeterminada
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Botón para agregar nueva dirección */}
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2 border-gray-300"
                    onClick={() => setShowAddressForm(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-gray-700">Agregar Nueva Dirección</span>
                  </Button>

                  {/* Botón para recargar direcciones */}
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={loadUserAddresses}
                  >
                    <Loader className="w-4 h-4" />
                    <span className="text-gray-600">Actualizar Direcciones</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resumen del Pedido */}
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
                    <span className="text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impuestos (16%)</span>
                    <span className="text-gray-900">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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

              {/* Información de Usuario */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="font-semibold text-purple-800 mb-1">👤 Información del Usuario</p>
                <p className="text-purple-700 text-sm">
                  Email: {userEmail || "No disponible"}
                </p>
                <p className="text-purple-700 text-sm">
                  Direcciones: {userAddresses.length} encontradas
                </p>
              </div>

              {/* Información de Envío */}
              {selectedAddress && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="font-semibold text-green-800 mb-1">✅ Dirección de Envío Seleccionada</p>
                  <p className="text-green-700 text-sm">
                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}
                  </p>
                </div>
              )}

              {/* Información del Pedido */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-gray-900 mb-1">Información del Pedido:</p>
                <p className="text-gray-700">• Items: {cart.items.length}</p>
                <p className="text-gray-700">• Usuario: Autenticado ✅</p>
                <p className="text-gray-700">• Email: {userEmail ? "Verificado ✅" : "No disponible"}</p>
                <p className="text-gray-700">• Dirección: {selectedAddress ? "Seleccionada ✅" : "Pendiente ❌"}</p>
                <p className="text-gray-700">• Total: {formatPrice(total)}</p>
              </div>

              {/* ❌ Mensaje de Error */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-400 rounded-lg p-4">
                  <p className="font-semibold text-red-800 mb-1">❌ Error</p>
                  <p className="text-red-700 text-sm">{errorMsg}</p>
                </div>
              )}

              {/* 🧭 Botón de Pago */}
              <Button
                onClick={handleCheckout}
                disabled={loading || !selectedAddress}
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

              {!selectedAddress && (
                <p className="text-red-600 text-sm text-center">
                  Por favor selecciona una dirección de envío para continuar
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ✅ COMPONENTE DE FORMULARIO DE DIRECCIÓN
function AddressForm({ onSave, onCancel, token }: { 
  onSave: (address: Address) => void; 
  onCancel: () => void;
  token: string | null;
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "México",
    phone: "",
    isDefault: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        console.log("✅ Dirección guardada:", data.data);
        onSave(data.data);
      } else {
        alert("Error guardando dirección: " + data.message);
      }
    } catch (error) {
      console.error("Error guardando dirección:", error);
      alert("Error guardando dirección");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Agregar Dirección de Envío
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calle y Número *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Av. Principal #123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Ciudad de México"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="CDMX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="+525512345678"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-2"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Establecer como dirección principal
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Guardando..." : "Guardar Dirección"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}