'use client';

import Image from 'next/image';
import { Product } from '../../types/api.types';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCartStore } from '../../lib/store';
import { useState } from 'react';

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const images = [product.image, product.image, product.image]; // Mock multiple images

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addItem(product, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 ${
                  selectedImage === index ? 'border-primary-600' : 'border-transparent'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category and Breadcrumb */}
          <div>
            <span className="text-primary-600 font-medium">{product.category}</span>
            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-300">4.2 (42 reseñas)</span>
            <span className="text-green-400 font-medium">En stock</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold">{formatPrice(product.price)}</span>
            {product.price > 1000 && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.price * 1.2)}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Descripción</h3>
            <p className="leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium">Cantidad:</span>
            <div className="flex items-center border border-gray-700 rounded-lg">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="px-3 py-2 text-gray-300 hover:text-white disabled:opacity-50"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-700 min-w-[60px] text-center">{quantity}</span>
              <button
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
                className="px-3 py-2 text-gray-300 hover:text-white disabled:opacity-50"
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-400">{product.stock} disponibles</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              isLoading={isAdding}
              className="flex-1"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Agregar al Carrito
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="w-5 h-5 mr-2" />
              Guardar
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-green-400" />
              <span className="text-sm">Envío gratis</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 text-green-400" />
              <span className="text-sm">Devolución fácil</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm">Garantía</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
