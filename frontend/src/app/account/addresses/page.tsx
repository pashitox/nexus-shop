'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../lib/store';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { MapPin, Plus, Edit, Trash2, Check, AlertCircle, Loader, X } from 'lucide-react';
import { apiClient } from '../../../types/api';
import { Address } from '../../../types/api.types';

export default function AddressesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<Omit<Address, 'id' | 'userId' | 'createdAt'>>({
    fullName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'México',
    phone: '',
    isDefault: false
  });

  // Cargar direcciones desde la API
  useEffect(() => {
    loadAddresses();
  }, [user, isAuthenticated]);

  const loadAddresses = async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await apiClient.getAddresses();
      setAddresses(response.data || []);
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError('Error al cargar las direcciones');
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'México',
      phone: '',
      isDefault: false
    });
    setEditingAddress(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setFormData({
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault
    });
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);

      if (editingAddress) {
        // ⚡ Casting mínimo para TypeScript
        await apiClient.updateAddress(editingAddress.id, formData as Omit<Address, 'id'>);
      } else {
        await apiClient.createAddress(formData as Omit<Address, 'id'>);
      }

      await loadAddresses();
      closeModal();
    } catch (err) {
      console.error('Error saving address:', err);
      setError(editingAddress ? 'Error al actualizar la dirección' : 'Error al crear la dirección');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta dirección?')) return;

    try {
      setIsDeleting(addressId);
      setError(null);
      await apiClient.deleteAddress(addressId);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Error al eliminar la dirección');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setError(null);
      await apiClient.setDefaultAddress(addressId);
      setAddresses(prev =>
        prev.map(addr => ({ ...addr, isDefault: addr.id === addressId }))
      );
    } catch (err) {
      console.error('Error setting default address:', err);
      setError('Error al establecer la dirección predeterminada');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-warning-800 mb-2">
            Acceso Requerido
          </h2>
          <p className="text-warning-700">Inicia sesión para ver tus direcciones</p>
        </div>
        <Button onClick={() => window.location.href = '/auth/login'}>
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Direcciones</h1>
          <p className="text-gray-600 mt-2">Gestiona tus direcciones de envío</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Dirección
        </Button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0" />
          <p className="text-error-800 text-sm">{error}</p>
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
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Dirección
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(address => (
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
                  <Button variant="outline" size="sm" onClick={() => openEditModal(address)}>
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
                        <Trash2 className="w-4 h-4 text-error-600" />
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
                {address.phone && <p className="text-sm text-gray-600">Tel: {address.phone}</p>}

                {address.isDefault ? (
                  <div className="flex items-center space-x-1 mt-2">
                    <Check className="w-4 h-4 text-success-600" />
                    <span className="text-sm text-success-600 font-medium">Dirección principal</span>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => handleSetDefault(address.id)}>
                    Establecer como principal
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAddress ? 'Editar Dirección' : 'Agregar Nueva Dirección'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre completo"
            value={formData.fullName}
            onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            required
            placeholder="Juan Pérez"
          />

          <Input
            label="Calle y número"
            value={formData.street}
            onChange={e => setFormData(prev => ({ ...prev, street: e.target.value }))}
            required
            placeholder="Av. Principal 123"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ciudad"
              value={formData.city}
              onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
              required
              placeholder="Ciudad de México"
            />
            <Input
              label="Estado"
              value={formData.state}
              onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
              required
              placeholder="CDMX"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Código Postal"
              value={formData.postalCode}
              onChange={e => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
              required
              placeholder="12345"
            />
            <Input
              label="País"
              value={formData.country}
              onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
              required
              placeholder="México"
            />
          </div>

          <Input
            label="Teléfono (opcional)"
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+52 55 1234 5678"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={e => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Establecer como dirección principal
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              {editingAddress ? 'Actualizar' : 'Crear'} Dirección
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
