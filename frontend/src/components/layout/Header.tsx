'use client';

import Link from 'next/link';
import { useAuthStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, User, Menu, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react'; // ✅ Agregar useRef
import { useRouter } from 'next/navigation';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // ✅ Referencia para el menú
  const router = useRouter();

  // ✅ Solo ejecutar en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    // ✅ Cerrar menú al presionar Escape
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  // ✅ Cerrar menú al cambiar ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [router]); // Se cierra cuando cambia la ruta

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false); // ✅ Cerrar menú después de logout
    router.push('/');
  };

  const handleNavigation = () => {
    setIsMenuOpen(false); // ✅ Cerrar menú al navegar
  };

  // ✅ Evitar renderizado durante hydration
  if (!isMounted) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo skeleton */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="w-24 h-6 bg-gray-300 rounded animate-pulse"></div>
            </div>
            {/* Navigation skeleton */}
            <div className="hidden md:flex space-x-8">
              <div className="w-12 h-6 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-16 h-6 bg-gray-300 rounded animate-pulse"></div>
            </div>
            {/* Actions skeleton */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-20 h-9 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" onClick={handleNavigation}>
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">NexusShop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 font-medium text-gray-700">
            <Link href="/" className="hover:text-primary-600 transition-colors" onClick={handleNavigation}>Inicio</Link>
            <Link href="/products" className="hover:text-primary-600 transition-colors" onClick={handleNavigation}>Productos</Link>
          </nav>

          {/* User & Cart Actions */}
          <div className="flex items-center space-x-4" ref={menuRef}> {/* ✅ Agregar ref aquí */}
            
            {/* Cart */}
            <Link 
              href="/cart" 
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
              onClick={handleNavigation}
            >
              <ShoppingCart className="w-6 h-6" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* Auth Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-expanded={isMenuOpen}
                  aria-label="Menú de usuario"
                >
                  <User className="w-5 h-5 text-gray-700" />
                  <span className="hidden sm:block text-sm font-medium text-gray-800">
                    {user?.name || user?.email}
                  </span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={handleNavigation}
                    >
                      Mi Cuenta
                    </Link>
                    <Link
                      href="/account/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={handleNavigation}
                    >
                      Mis Pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login" onClick={handleNavigation}>
                  <Button variant="outline" size="sm">Iniciar Sesión</Button>
                </Link>
                <Link href="/register" onClick={handleNavigation}>
                  <Button size="sm">Registrarse</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Menú móvil"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3 px-2">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-primary-600 transition-colors py-2" 
                onClick={handleNavigation}
              >
                Inicio
              </Link>
              <Link 
                href="/products" 
                className="text-gray-700 hover:text-primary-600 transition-colors py-2" 
                onClick={handleNavigation}
              >
                Productos
              </Link>
              
              {/* Enlaces de autenticación en móvil */}
              {!isAuthenticated && (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-primary-600 transition-colors py-2" 
                    onClick={handleNavigation}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    href="/register" 
                    className="text-gray-700 hover:text-primary-600 transition-colors py-2" 
                    onClick={handleNavigation}
                  >
                    Registrarse
                  </Link>
                </>
              )}
              
              {/* Mobile Search */}
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onFocus={() => setIsMenuOpen(false)} // ✅ Cerrar menú al buscar
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};