'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../lib/store';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { MapPin, Plus, Edit, Trash2, Check, AlertCircle, Loader } from 'lucide-react';
import { apiClient } from '../../../types/api';
import { Address } from '../../../types/api.types';

export default function AddressesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Cargar direcciones desde la API
  useEffect(() => {
    const loadAddresses = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const response = await apiClient.getAddresses();
        
        if (response.data) {
          setAddresses(response.data);
        } else {
          setAddresses([]);
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
        setError('Error al cargar las direcciones');
        setAddresses([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAddresses();
  }, [user, isAuthenticated]);

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
      return;
    }

    try {
      setIsDeleting(addressId);
      setError(null);
      
      await apiClient.deleteAddress(addressId);
      
      // Actualizar la lista de direcciones
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Error al eliminar la dirección');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setError(null);
      await apiClient.setDefaultAddress(addressId);
      
      // Actualizar las direcciones marcando la nueva como predeterminada
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }))
      );
    } catch (error) {
      console.error('Error setting default address:', error);
      setError('Error al establecer la dirección predeterminada');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Acceso Requerido
          </h2>
          <p className="text-yellow-700">Inicia sesión para ver tus direcciones</p>
        </div>
        <Button onClick={() => window.location.href = '/auth/login'}>
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Direcciones</h1>
          <p className="text-gray-600 mt-2">Gestiona tus direcciones de envío</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Dirección
        </Button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-64">
          <Loader className="w-8 h-8 text-primary-500 animate-spin mr-3" />
          <div className="text-lg text-gray-600">Cargando direcciones...</div>
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes direcciones guardadas</h3>
            <p className="text-gray-600 mb-4">Agrega tu primera dirección para facilitar tus compras</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Dirección
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`relative ${address.isDefault ? 'border-primary-500 border-2' : 'border-gray-200'}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    {address.isDefault ? '🏠 Dirección Principal' : 'Dirección de Envío'}
                  </h3>
                </div>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!address.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={isDeleting === address.id}
                    >
                      {isDeleting === address.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-600" />
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium text-gray-900">{address.fullName}</p>
                <p className="text-sm text-gray-600">
                  {address.street}, {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-sm text-gray-600">{address.country}</p>
                {address.phone && (
                  <p className="text-sm text-gray-600">Tel: {address.phone}</p>
                )}
                
                {address.isDefault ? (
                  <div className="flex items-center space-x-1 mt-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Dirección principal</span>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Establecer como principal
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}