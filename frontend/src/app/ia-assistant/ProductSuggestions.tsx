'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '../../types/ai.types';

interface ProductSuggestionsProps {
  products: Product[];
}

export const ProductSuggestions: React.FC<ProductSuggestionsProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  console.log('🛍️ Renderizando ProductSuggestions:', products);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-600 mb-2">🎁 Productos recomendados:</p>
      <div className="space-y-2">
        {products.map((product) => (
          <Link
            key={product.id}
            // 🔥 CORRECCIÓN: Usar el ID en lugar del slug para la URL
            href={`/products/${product.id}`}
            className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group"
          >
            {/* Imagen del producto */}
            <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg border border-gray-300 overflow-hidden flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                  📦
                </div>
              )}
            </div>
            
            {/* Información del producto */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {product.name}
              </p>
              <p className="text-sm text-gray-500">
                ${product.price?.toLocaleString('es-MX') || '0'}
              </p>
              <p className="text-xs text-gray-400 capitalize">{product.category}</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};