
"use client";

import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">🔍</span>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
          <p className="text-gray-600 mb-8">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/" className="block">
            <Button className="w-full" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
          
          <Link href="/products" className="block">
            <Button variant="outline" className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Explorar Productos
            </Button>
          </Link>

          <button 
            onClick={() => window.history.back()}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
}