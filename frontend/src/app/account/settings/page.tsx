'use client';

import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { User, Mail, LogOut, Key } from 'lucide-react';

export default function SettingsPage() {
  const { token, user, logout } = useAuthStore();

  useEffect(() => {
    if (!token) {
      redirect('/auth/login');
    }
  }, [token]);

  if (!token) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">Gestiona la configuración de tu cuenta</p>
      </div>

      {/* Información del usuario */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-600">Nombre</p>
              <p className="text-gray-900">{user?.name || 'No especificado'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-gray-900">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Estado</p>
              <p className="text-success-700 font-medium">Cuenta activa</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones de cuenta */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Acciones de Cuenta</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="justify-start sm:justify-center"
              onClick={() => alert('Funcionalidad no implementada aún')}
            >
              <Key className="w-4 h-4 mr-2" />
              Cambiar contraseña
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start sm:justify-center text-error-600 border-error-200 hover:bg-error-50"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferencias */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Preferencias</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm">
            Las opciones de preferencias estarán disponibles próximamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}