'use client';

import React from 'react';
import { AIMessage, Product } from '../../types/ai.types';
import { ProductSuggestions } from '../../app/ia-assistant/ProductSuggestions';

interface ChatMessageProps {
  message: AIMessage;
  products?: Product[];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, products }) => {
  const isUser = message.role === 'user';
  
  // 🔥 CORRECCIÓN: Unificar fuentes de productos
  const displayProducts = products || message.products || [];
  
  console.log('💬 Renderizando mensaje:', {
    role: message.role, 
    content: message.content,
    productsCount: displayProducts.length
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl p-4 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
        }`}
      >
        {/* Mensaje de texto */}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
        
        {/* Productos recomendados - SOLO para assistant y si hay productos */}
        {!isUser && displayProducts.length > 0 && (
          <div className="mt-3">
            <ProductSuggestions products={displayProducts} />
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};