'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-6xl">😵</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Error Crítico!</h1>
              <p className="text-gray-600 mb-4">
                Ha ocurrido un error inesperado en la aplicación.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={reset} className="w-full" size="lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
              
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}