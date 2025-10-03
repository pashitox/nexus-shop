'use client';

import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function SettingsPage() {
  const { token, user, logout } = useAuthStore();

  useEffect(() => {
    if (!token) {
      redirect('/login');
    }
  }, [token]);

  if (!token) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configuración de la Cuenta</h1>

      {/* Información del usuario */}
      <Card>
        <CardContent className="p-6 space-y-2">
          <h2 className="font-semibold text-lg">Información de usuario</h2>
          <p><span className="font-medium">Nombre:</span> {user?.name}</p>
          <p><span className="font-medium">Email:</span> {user?.email}</p>
        </CardContent>
      </Card>

      {/* Acciones provisionales */}
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row gap-4">
          <Button
            variant="primary"
            onClick={() => alert('Funcionalidad no implementada aún')}
          >
            Cambiar contraseña
          </Button>
          <Button variant="outline" onClick={logout}>
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
