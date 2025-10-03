'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { User, Mail, Calendar, Edit, Save, X, MapPin, Package, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../types/api';

interface UserStats {
  orderCount: number;
  totalSpent: number;
  addressCount: number;
}

export default function AccountPage() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [stats, setStats] = useState<UserStats>({
    orderCount: 0,
    totalSpent: 0,
    addressCount: 0,
  });

  // 📌 Función para cargar estadísticas del usuario desde la API
  const loadUserStats = async () => {
    try {
      const ordersResponse = await apiClient.getOrders();
      const orders = ordersResponse.data || [];

      const addressesResponse = await apiClient.getAddresses();
      const addresses = addressesResponse.data || [];

      // Calcular estadísticas
      const totalSpent = orders.reduce((total: number, order: any) => {
        return total + (Number(order.total) || 0);
      }, 0);

      setStats({
        orderCount: orders.length,
        totalSpent,
        addressCount: addresses.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        orderCount: 0,
        totalSpent: 0,
        addressCount: 0,
      });
    }
  };

  // 📌 Cargar datos del usuario y estadísticas
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);

        // Inicializar formulario con datos del store
        setFormData({
          name: user.name || '',
          email: user.email || '',
        });

        // Cargar estadísticas reales
        await loadUserStats();
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Error al cargar los datos del perfil');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, isAuthenticated]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      setError(null);

      // Aquí iría la llamada real a la API de update profile
      console.log('Actualizando perfil:', formData);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simular delay

      // Actualizar en el store
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setError(null);
  };

  // 📌 Loading
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg text-gray-500">Cargando tu perfil...</div>
        </div>
      </div>
    );
  }

  // 📌 Usuario no autenticado
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Acceso Requerido
          </h2>
          <p className="text-yellow-700">
            Debes iniciar sesión para ver tu perfil
          </p>
        </div>
        <Button onClick={() => router.push('/auth/login')}>
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  // 📌 Página principal de cuenta
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
          <p className="text-gray-600 mt-2">Gestiona tu perfil y preferencias</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Perfil */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Input
                label="Nombre completo"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing || isSaving}
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing || isSaving}
                leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              />

              <Input
                label="Miembro desde"
                value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-MX') : 'No disponible'}
                disabled
                leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
              />
            </CardContent>
          </Card>
        </div>

        {/* Navegación + Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Accesos Rápidos</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/account/addresses')}>
                <MapPin className="w-4 h-4 mr-2" />
                Mis Direcciones
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/orders')}>
                <Package className="w-4 h-4 mr-2" />
                Mis Pedidos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Resumen</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pedidos</span>
                <span className="font-semibold text-primary-600">{stats.orderCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Gastado</span>
                <span className="font-semibold text-green-600">${stats.totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Direcciones</span>
                <span className="font-semibold text-blue-600">{stats.addressCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
