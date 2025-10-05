'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Eye, EyeOff, Mail, Lock, Github, Loader } from 'lucide-react';

// ✅ Componente para el botón de Google
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, googleLogin } = useAuthStore();
  const router = useRouter();

  // ✅ CARGAR GOOGLE SCRIPT AL INICIAR
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) return Promise.resolve();

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load Google script'));
        document.head.appendChild(script);
      });
    };

    loadGoogleScript().catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ MÉTODO SIMPLE Y FUNCIONAL - Google Identity Services
  const handleGoogleLogin = () => {
    setError('');
    setGoogleLoading(true);

    if (!window.google) {
      setError('Google Auth no está disponible. Recarga la página.');
      setGoogleLoading(false);
      return;
    }

    try {
      // ✅ INICIALIZAR GOOGLE IDENTITY SERVICES
      google.accounts.id.initialize({
        client_id: '479463812136-c44nrt1h74i6t8re4tb6ut8dgia4ud0g.apps.googleusercontent.com',
        callback: async (response: any) => {
          if (response.credential) {
            try {
              await googleLogin(response.credential);
              router.push('/');
            } catch (err: any) {
              setError(err.message || 'Error al autenticar con Google');
            } finally {
              setGoogleLoading(false);
            }
          }
        }
      });

      // ✅ MOSTRAR EL POPUP DE GOOGLE
      google.accounts.id.prompt();

    } catch (err: any) {
      setError('Error al iniciar Google Auth');
      setGoogleLoading(false);
    }
  };

  // ✅ MÉTODO ALTERNATIVO - Si el anterior falla
  const handleGoogleLoginAlternative = () => {
    setError('');
    setGoogleLoading(true);

    // ✅ PARÁMETROS MÍNIMOS Y VÁLIDOS
    const params = new URLSearchParams({
      client_id: '479463812136-c44nrt1h74i6t8re4tb6ut8dgia4ud0g.apps.googleusercontent.com',
      redirect_uri: window.location.origin,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: Math.random().toString(36).substring(2, 15),
      prompt: 'select_account'
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    
    // Redirigir directamente
    window.location.href = googleAuthUrl;
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
            
            {/* Social Login */}
            <div className="space-y-4 mb-6">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-3 py-3 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                <span className="text-gray-700 font-medium">
                  {googleLoading ? 'Conectando...' : 'Continuar con Google'}
                </span>
              </Button>

              {/* Botón alternativo si el principal falla */}
              <div className="text-center">
                <button 
                  onClick={handleGoogleLoginAlternative}
                  className="text-sm text-primary-600 hover:text-primary-700 underline"
                >
                  ¿Problemas con Google? Usar método alternativo
                </button>
              </div>

              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-3 py-3 border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <Github className="w-5 h-5 text-gray-700" />
                <span className="text-gray-700 font-medium">Continuar con GitHub</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-medium">O ingresa con tu email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                className="bg-white"
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
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? 
                      <EyeOff className="w-5 h-5" /> : 
                      <Eye className="w-5 h-5" />
                    }
                  </button>
                }
                className="bg-white"
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2" 
                  />
                  <span>Recordar mi cuenta</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button 
                type="submit" 
                isLoading={isLoading} 
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
            <Link 
              href="/register" 
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}