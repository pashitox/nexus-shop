'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCartStore } from '../../lib/store';
import { Address, Order } from '../../types/api.types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { formatPrice } from '../../lib/utils';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  Plus,
  Edit
} from 'lucide-react';
import { apiClient } from '../../types/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { cart, getTotal, getItemCount, clearCart } = useCartStore();
  
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(!isAuthenticated);

  // Datos del formulario
  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'México',
    phone: ''
  });

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      router.push('/cart');
      return;
    }

    if (isAuthenticated) {
      loadAddresses();
    }
  }, [cart, isAuthenticated, router]);

  const loadAddresses = async () => {
    try {
      const addressesData = await apiClient.getAddresses();
      setAddresses(addressesData);
      
      const defaultAddress = addressesData.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
        setFormData(prev => ({
          ...prev,
          fullName: defaultAddress.fullName,
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          postalCode: defaultAddress.postalCode,
          country: defaultAddress.country,
          phone: defaultAddress.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      setFormData(prev => ({
        ...prev,
        fullName: address.fullName,
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone || ''
      }));
    }
  };

  const validateStep1 = () => {
    return formData.fullName && formData.street && formData.city && 
           formData.state && formData.postalCode && formData.phone;
  };

  const handlePlaceOrder = async () => {
    if (!validateStep1()) return;

    setIsLoading(true);
    try {
      const orderData = {
        shippingAddress: formData,
        items: cart?.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        })) || [],
        total: getTotal(),
        ...(isGuest && { guestEmail: formData.email, guestName: formData.fullName })
      };

      const order = await apiClient.createOrder(orderData);
      
      // Limpiar carrito después de la orden exitosa
      clearCart();
      
      // Redirigir a la página de confirmación
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const subtotal = getTotal();
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

      {/* Progress Steps */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= stepNumber 
                  ? 'bg-primary-600 border-primary-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {stepNumber}
              </div>
              <span className={`ml-2 font-medium ${
                step >= stepNumber ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {stepNumber === 1 && 'Envío'}
                {stepNumber === 2 && 'Pago'}
                {stepNumber === 3 && 'Confirmación'}
              </span>
              {stepNumber < 3 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  step > stepNumber ? 'bg-primary-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Dirección de Envío
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Guest Check */}
                {!isAuthenticated && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      ¿Ya tienes una cuenta?{' '}
                      <button 
                        onClick={() => router.push('/login?redirect=/checkout')}
                        className="font-medium underline"
                      >
                        Inicia sesión
                      </button>{' '}
                      para una experiencia más rápida.
                    </p>
                  </div>
                )}

                {/* Saved Addresses */}
                {isAuthenticated && addresses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Direcciones guardadas</h3>
                    <div className="grid gap-3">
                      {addresses.map((address) => (
                        <label key={address.id} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddress === address.id}
                            onChange={() => handleAddressSelect(address.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{address.fullName}</span>
                              {address.isDefault && (
                                <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                                  Predeterminada
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.street}, {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p className="text-sm text-gray-600">{address.phone}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => router.push('/account/addresses')}
                      className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Gestionar direcciones
                    </button>

                    <div className="border-t pt-4">
                      <h3 className="font-medium text-gray-900 mb-4">O usar una nueva dirección</h3>
                    </div>
                  </div>
                )}

                {/* Address Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isGuest && (
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                  )}
                  
                  <Input
                    label="Nombre completo"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    leftIcon={<User className="w-4 h-4" />}
                  />
                  
                  <Input
                    label="Teléfono"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    leftIcon={<Phone className="w-4 h-4" />}
                  />
                  
                  <Input
                    label="Calle y número"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                  
                  <Input
                    label="Ciudad"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <Input
                    label="Estado"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <Input
                    label="Código Postal"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <Input
                    label="País"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    disabled
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/cart')}
                  >
                    Volver al Carrito
                  </Button>
                  
                  <Button 
                    onClick={() => setStep(2)}
                    disabled={!validateStep1()}
                  >
                    Continuar al Pago
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Método de Pago
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    💡 <strong>Modo demostración:</strong> Esta es una simulación. No se procesarán pagos reales.
                  </p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" defaultChecked className="text-primary-600" />
                    <CreditCard className="w-6 h-6 text-gray-600" />
                    <span className="font-medium">Tarjeta de Crédito/Débito</span>
                  </label>

                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" className="text-primary-600" />
                    <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="font-medium">PayPal</span>
                  </label>

                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" className="text-primary-600" />
                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">O</span>
                    </div>
                    <span className="font-medium">OXXO</span>
                  </label>
                </div>

                {/* Credit Card Form (simplificado) */}
                <div className="border rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Número de tarjeta" placeholder="1234 5678 9012 3456" />
                    <Input label="Nombre en la tarjeta" placeholder="JUAN PEREZ" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="MM/AA" placeholder="12/25" />
                    <Input label="CVV" placeholder="123" />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Volver a Envío
                  </Button>
                  
                  <Button 
                    onClick={handlePlaceOrder}
                    isLoading={isLoading}
                  >
                    Realizar Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Resumen del Pedido</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({getItemCount()} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Impuestos (16%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span>Pago 100% seguro</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}