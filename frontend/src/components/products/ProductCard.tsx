'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../../types/api.types';
import { formatPrice } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useCart } from '../../hooks/useCart'; // ✅ Usar el hook en lugar del store directamente
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart(); // ✅ Usar el hook que maneja notificaciones
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0) return;
    
    setIsAdding(true);
    try {
      await addItem(product, 1);
      // ✅ Las notificaciones se manejan automáticamente en el hook
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/images/placeholder-product.jpg';
  };

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <Image
            src={product.image || '/images/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
          
          {/* Wishlist Button */}
          <button 
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // TODO: Implementar wishlist
            }}
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </button>

          {/* Stock Status */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold bg-red-600 px-3 py-1 rounded-full text-sm">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full mb-2">
              {product.category}
            </span>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-1">(42)</span>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.stock > 0 ? (
                <p className="text-sm text-green-600">En stock ({product.stock})</p>
              ) : (
                <p className="text-sm text-red-600">Agotado</p>
              )}
            </div>

            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              isLoading={isAdding}
              className="flex-shrink-0"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              {isAdding ? 'Agregando...' : 'Agregar'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};