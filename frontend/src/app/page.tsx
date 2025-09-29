'use client';

import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { ProductGrid } from '../components/products/ProductGrid';
import { apiClient } from '../types/api';
import { Product } from '../types/api.types';
import { useEffect, useState } from 'react';
import { ArrowRight, Shield, Truck, Clock, Star } from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const response = await apiClient.getProducts({});
        setFeaturedProducts((response.products || []).slice(0, 8));

      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenido a <span className="text-yellow-300">NexusShop</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Descubre los mejores productos al mejor precio. Tecnología, hogar, moda y mucho más.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" variant="secondary" className="text-primary-600">
                  Ver Productos
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                  Explorar Categorías
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Envío Gratis</h3>
            <p className="text-gray-600">En compras mayores a $500 MXN</p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Pago Seguro</h3>
            <p className="text-gray-600">Transacciones 100% protegidas</p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Soporte 24/7</h3>
            <p className="text-gray-600">Estamos aquí para ayudarte</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Productos Destacados</h2>
            <p className="text-gray-600 mt-2">Los productos más populares de nuestra tienda</p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="flex items-center space-x-2">
              <span>Ver Todos</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={featuredProducts} />
        )}
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Explora por Categorías</h2>
            <p className="text-gray-600 mt-2">Encuentra lo que buscas fácilmente</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Electrónicos', slug: 'electronics', color: 'bg-blue-100', icon: '📱' },
              { name: 'Ropa', slug: 'clothing', color: 'bg-green-100', icon: '👕' },
              { name: 'Hogar', slug: 'home', color: 'bg-yellow-100', icon: '🏠' },
              { name: 'Deportes', slug: 'sports', color: 'bg-red-100', icon: '⚽' },
            ].map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="block group"
              >
                <div className={`${category.color} rounded-lg p-6 text-center group-hover:shadow-lg transition-shadow`}>
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Ver productos</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}