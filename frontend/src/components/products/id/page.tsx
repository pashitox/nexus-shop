'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '../../../types/api.types';
import { apiClient } from '../../../types/api';
import { ProductDetails } from '../../products/ProductDetails';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { Button } from '../../ui/Button';
import { ArrowLeft } from 'lucide-react';



export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      setError('');
      const productData = await apiClient.getProduct(productId);
      setProduct(productData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el producto');
      console.error('Error loading product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Button 
          variant="outline" 
          onClick={() => router.push('/products')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a productos
        </Button>
        
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😞</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'El producto que buscas no existe.'}</p>
          <Button onClick={() => router.push('/products')}>
            Explorar Productos
          </Button>
        </div>
      </div>
    );
  }

  return <ProductDetails product={product} />;
}