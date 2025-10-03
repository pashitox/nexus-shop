'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { User, Mail, Calendar, Edit, Save, X, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [stats, setStats] = useState({
    orderCount: 0,
    totalSpent: 0,
    addressCount: 0
  });

  useEffect(() => {
    // Verificar autenticación después de que el componente se monte
    const checkAuth = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setFormData({
          name: user.name || '',
          email: user.email || '',
        });

        // Simular carga de estadísticas
        setTimeout(() => {
          setStats({
            orderCount: 5,
            totalSpent: 12450,
            addressCount: 2
          });
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading account data:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, isAuthenticated]);

  const handleSave = async () => {
    try {
      // Lógica para actualizar perfil
      console.log('Actualizando perfil:', formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  // Redirigir a login si no está autenticado
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Acceso Requerido
          </h2>
          <p className="text-yellow-700">
            Debes iniciar sesión para ver tu perfil
          </p>
        </div>
        <Button 
          onClick={() => router.push('/auth/login')}
          className="flex items-center mx-auto"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg text-gray-600">Cargando tu perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Información Personal</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={!isEditing}
            leftIcon={<User className="w-5 h-5 text-gray-400" />}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            disabled={!isEditing}
            leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
          />

          <Input
            label="Miembro desde"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-MX') : 'Fecha no disponible'}
            disabled
            leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
          />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.orderCount}</div>
            <div className="text-sm text-gray-600">Pedidos Completados</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">${stats.totalSpent.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Gastado</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.addressCount}</div>
            <div className="text-sm text-gray-600">Direcciones Guardadas</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}