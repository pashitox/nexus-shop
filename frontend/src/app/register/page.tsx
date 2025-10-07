'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Eye, EyeOff, Mail, Lock, User, Check } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuthStore();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.email, formData.password, formData.name);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al registrar la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { text: 'Mínimo 6 caracteres', met: formData.password.length >= 6 },
    { text: 'Letras y números', met: /[a-zA-Z]/.test(formData.password) && /[0-9]/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="mt-2 text-gray-600">Únete a <span className="font-semibold">NexusShop</span> y descubre un mundo de posibilidades</p>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <Input
                label="Nombre completo"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
                leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              />

              <Input
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />

              {/* Password Requirements */}
              <div className="space-y-1">
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm">
                    <Check className={`w-4 h-4 ${req.met ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={req.met ? 'text-green-600' : 'text-gray-500'}>{req.text}</span>
                  </div>
                ))}
              </div>

              <Input
                label="Confirmar contraseña"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                rightIcon={
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />

              <div className="flex items-center text-sm text-gray-600">
                <input type="checkbox" required className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="ml-2">
                  Acepto los{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700">términos y condiciones</Link> y la{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700">política de privacidad</Link>
                </span>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
                Crear Cuenta
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center text-gray-600 text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
