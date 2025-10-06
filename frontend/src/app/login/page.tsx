'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Eye, EyeOff, Mail, Lock, Loader } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('test@nexus.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuthStore();
  const router = useRouter();

  // ✅ LOGIN MANUAL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);

      const token = localStorage.getItem('token');
      console.log('🔍 Token después del login:', token ? `✅ (${token.length} chars)` : '❌ NO ENCONTRADO');
      
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ LOGIN RÁPIDO TEST
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@nexus.com', password: 'password123' })
      });

      const data = await response.json();
      if (data.success) {
        const token = data.data.token;
        localStorage.setItem('token', token);

        useAuthStore.getState().setUser(data.data.user);
        useAuthStore.getState().setToken(token);

        router.push('/');
      } else {
        throw new Error(data.message || 'Error en login');
      }
    } catch (err: any) {
      setError('Error: ' + err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

// ✅ GOOGLE OAUTH REAL - CON PUERTO 3000
const handleRealGoogleLogin = () => {
  setError('');
  setGoogleLoading(true);

  // ✅ REDIRECT_URI CON PUERTO 3000
  const redirectUri = 'http://localhost:3000/auth/callback';
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=479463812136-c44nrt1h74i6t8re4tb6ut8dgia4ud0g.apps.googleusercontent.com&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile&` +
    `access_type=online&` +
    `prompt=consent`;

  console.log('🔗 Redirigiendo a Google OAuth REAL...');
  console.log('📋 Redirect URI exacto:', redirectUri);
  window.location.href = googleAuthUrl;
  setGoogleLoading(false);
};

  // ✅ CREAR USUARIO TEST
  const handleCreateTestUser = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${Date.now()}@nexus.com`,
          password: 'password123',
          name: 'Test User'
        })
      });

      const data = await response.json();
      if (data.success) {
        const token = data.data.token;
        localStorage.setItem('token', token);

        useAuthStore.getState().setUser(data.data.user);
        useAuthStore.getState().setToken(token);

        router.push('/');
      } else {
        setError('Error creando usuario: ' + data.message);
      }
    } catch {
      setError('Error creando usuario de prueba');
    } finally {
      setGoogleLoading(false);
    }
  };

  // ✅ LIMPIAR STORAGE
  const handleClearAndTest = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth-storage');
    handleGoogleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido de nuevo</h1>
          <p className="mt-2 text-gray-600">
            Ingresa a tu cuenta de <span className="font-semibold text-primary-600">NexusShop</span>
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            
            {/* Botones de prueba */}
            <div className="space-y-4 mb-6">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-3 py-3 border-gray-300 hover:bg-gray-50"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? <Loader className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
                <span className="text-gray-700 font-medium">
                  {googleLoading ? 'Conectando...' : 'Acceso Rápido (Test)'}
                </span>
              </Button>

              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-3 py-3 border-blue-300 bg-blue-50 hover:bg-blue-100"
                onClick={handleRealGoogleLogin}
                disabled={googleLoading}
              >
                <GoogleIcon />
                <span className="text-blue-700 font-medium">
                  Login con Google REAL
                </span>
              </Button>

              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-3 py-3 border-green-300 bg-green-50 hover:bg-green-100"
                onClick={handleCreateTestUser}
                disabled={googleLoading}
              >
                <span className="text-green-700 font-medium">
                  Crear Usuario de Prueba
                </span>
              </Button>

              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-3 py-3 border-red-300 bg-red-50 hover:bg-red-100"
                onClick={handleClearAndTest}
              >
                <span className="text-red-700 font-medium">
                  🔄 Limpiar y Probar Desde Cero
                </span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">O ingresa manualmente</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <strong>Credenciales de prueba:</strong><br/>
                Email: test@nexus.com<br/>
                Password: password123
              </div>

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              />

              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-gray-600">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-2" />
                  <span>Recordar mi cuenta</span>
                </label>
                <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button 
                type="submit" 
                isLoading={isLoading} 
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white"
                size="lg"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
