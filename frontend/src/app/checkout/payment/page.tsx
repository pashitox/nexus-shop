// frontend/src/app/checkout/payment/page.tsx - VERSIÓN CORREGIDA
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Loader, Shield, CheckCircle } from 'lucide-react';

// ✅ Stripe Promise seguro
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  // ✅ Obtener clientSecret de forma segura
  useEffect(() => {
    const clientSecretParam = searchParams.get('clientSecret');
    if (clientSecretParam) {
      setClientSecret(clientSecretParam);
    }
  }, [searchParams]);

  // ✅ Verificar si el pago ya fue procesado
  useEffect(() => {
    if (!stripe || !clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (paymentIntent?.status === 'succeeded') {
        setSucceeded(true);
      }
    });
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setError('');

    try {
      // ✅ SOLUCIÓN: Pasar billing details en confirmParams
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
          // ✅ Agregar billing details aquí
          payment_method_data: {
            billing_details: {
              name: billingDetails.name || 'Cliente',
              email: billingDetails.email || 'cliente@ejemplo.com',
              phone: billingDetails.phone || '+525511223344',
            }
          }
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Error al procesar el pago');
      } else if (paymentIntent?.status === 'succeeded') {
        setSucceeded(true);
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${orderId}`);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en los datos de facturación
  const handleBillingChange = (field: string, value: string) => {
    setBillingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ Mensaje de carga inicial
  if (!clientSecret) {
    return (
      <div className="text-center py-12">
        <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Cargando información de pago...</p>
      </div>
    );
  }

  // ✅ Estado de éxito
  if (succeeded) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h2>
        <p className="text-gray-600 mb-6">Tu pago ha sido procesado correctamente.</p>
        <Button onClick={() => router.push(`/checkout/success?orderId=${orderId}`)}>
          Ver Detalles de la Orden
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 🛡️ Caja informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-800">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Pago seguro con Stripe</span>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Tu información de pago está encriptada y protegida.
        </p>
      </div>

      {/* 📝 Datos de Facturación (Opcional) */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Datos de Facturación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              value={billingDetails.name}
              onChange={(e) => handleBillingChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={billingDetails.email}
              onChange={(e) => handleBillingChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="juan@ejemplo.com"
            />
          </div>
        </div>
      </div>

      {/* 💳 Elemento de pago - CONFIGURACIÓN CORREGIDA */}
      <PaymentElement 
        options={{ 
          layout: 'tabs',
          // ✅ CONFIGURACIÓN SEGURA - sin fields restrictivos
          fields: {
            billingDetails: {
              name: 'auto',    // ← 'auto' en lugar de 'never'
              email: 'auto',
              phone: 'auto',
            }
          }
        }} 
      />

      {/* ⚠️ Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 💰 Botón principal */}
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full py-3 text-lg bg-black hover:bg-gray-900 text-white rounded-xl"
      >
        {isLoading ? (
          <>
            <Loader className="w-5 h-5 animate-spin mr-2" />
            Procesando Pago...
          </>
        ) : (
          `Pagar $${amount ? (parseFloat(amount) / 100).toFixed(2) : '0.00'}`
        )}
      </Button>

      {/* 🔙 Botón volver */}
      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-700 border-gray-300 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Checkout
        </Button>
      </div>
    </form>
  );
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  // ✅ Obtener clientSecret de forma segura
  useEffect(() => {
    const clientSecretParam = searchParams.get('clientSecret');
    if (clientSecretParam) {
      setClientSecret(clientSecretParam);
      setIsReady(true);
    }
  }, [searchParams]);

  // ✅ SOLUCIÓN: Configuración corregida sin paymentMethodConfiguration
  const options = {
    clientSecret: clientSecret || undefined, // ✅ Asegurar que no sea null
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#000000',
        borderRadius: '8px',
        fontFamily: 'Inter, sans-serif',
      },
    },
  };

  // ✅ Mostrar loading mientras se carga clientSecret
  if (!isReady || !stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              {!stripePromise 
                ? 'Error: Stripe no está configurado correctamente' 
                : 'Cargando información de pago...'
              }
            </p>
            {!stripePromise && (
              <Button onClick={() => window.history.back()}>
                Volver al Checkout
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Completar Pago</h1>
          <p className="text-gray-600">Orden #{orderId?.slice(-8)}</p>
          <p className="text-lg font-semibold text-green-600 mt-2">
            Total: ${amount ? (parseFloat(amount) / 100).toFixed(2) : '0.00'}
          </p>
        </div>

        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <h2 className="text-xl font-semibold">Información de Pago</h2>
          </CardHeader>
          <CardContent className="p-6">
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm />
            </Elements>
          </CardContent>
        </Card>

        {/* 🧠 Sección de seguridad */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
          <div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-green-600">🔒</span>
            </div>
            <span>Encriptado SSL</span>
          </div>
          <div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-blue-600">🛡️</span>
            </div>
            <span>Protegido</span>
          </div>
          <div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-purple-600">✓</span>
            </div>
            <span>Verificado</span>
          </div>
        </div>
      </div>
    </div>
  );
}