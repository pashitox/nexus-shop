'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando autenticación con Google...');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        
        console.log('🔑 Google callback recibido:', { code, error });

        if (error) {
          setStatus('error');
          setMessage(`Error de Google: ${error}`);
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No se recibió código de autorización de Google');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        console.log('🔄 Intercambiando código por token...');
        
        // Intercambiar código por token JWT de NexusShop
        const response = await fetch('http://localhost:5001/api/auth/google/code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (data.success) {
          console.log('✅ Autenticación Google exitosa:', data.data.user.email);
          
          // Guardar token y usuario
          const token = data.data.token;
          localStorage.setItem('token', token);
          setUser(data.data.user);
          setToken(token);
          
          setStatus('success');
          setMessage('¡Autenticación exitosa! Redirigiendo...');
          setTimeout(() => router.push('/'), 2000);
        } else {
          throw new Error(data.message || 'Error en autenticación Google');
        }

      } catch (err: any) {
        console.error('❌ Error en callback de Google:', err);
        setStatus('error');
        setMessage('Error: ' + err.message);
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, setUser, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <span className="text-white font-bold text-2xl">N</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'loading' && 'Autenticando con Google...'}
          {status === 'success' && '¡Éxito!'}
          {status === 'error' && 'Error'}
        </h1>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {status === 'error' && (
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Volver al Login
          </button>
        )}
      </div>
    </div>
  );
}