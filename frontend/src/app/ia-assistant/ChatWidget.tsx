'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatAssistant } from '../../hooks/useChatAssistant';
import { ChatMessage } from './ChatMessage';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, isTyping, sessionId, isAuthenticated, startChat, sendMessage } = useChatAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && isAuthenticated && !sessionId) {
      console.log('🔄 Iniciando chat automáticamente...');
      startChat();
    }
  }, [isOpen, isAuthenticated, sessionId, startChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('🔐 Por favor, inicia sesión para usar el asistente de IA.');
      return;
    }

    if (!inputMessage.trim() || isTyping) return;

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (!isAuthenticated) {
      alert('🔐 Por favor, inicia sesión para usar el asistente de IA.');
      return;
    }
    await sendMessage(suggestion);
  };

  const toggleChat = () => {
    if (!isAuthenticated) {
      alert('🔐 Inicia sesión para hablar con nuestro asistente de IA.');
      return;
    }
    
    setIsOpen(!isOpen);
    if (!isOpen && !sessionId) {
      startChat();
    }
  };

  // Sugerencias rápidas
  const quickSuggestions = [
    "Recomiéndame un smartphone elegante",
    "Tengo presupuesto de $2000",
    "Necesito ropa casual", 
    "¿Qué electrónicos tienes?",
    "Busco un regalo especial"
  ];

  // 🔥 CORRECCIÓN: Variables seguras para el debug
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMessageContent = lastMessage?.content || '';
  const lastMessageProducts = lastMessage?.products || [];
  const lastMessageProductsCount = lastMessageProducts.length;

  // Si no está autenticado, NO mostrar el botón
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* 🔥 DEBUG PANEL CORREGIDO - Sin errores TypeScript */}
      {messages.length > 0 && (
        <div className="fixed top-4 left-4 bg-yellow-100 border border-yellow-400 rounded p-2 text-xs z-50 shadow-lg max-w-xs">
          <div className="font-bold text-yellow-800 mb-1">🐛 DEBUG CHAT</div>
          <div><strong>Mensajes:</strong> {messages.length}</div>
          <div><strong>Último:</strong> {lastMessageContent.substring(0, 30)}{lastMessageContent.length > 30 ? '...' : ''}</div>
          <div><strong>Productos último:</strong> {lastMessageProductsCount}</div>
          <div><strong>Typing:</strong> {isTyping ? '✅' : '❌'}</div>
          <div><strong>Session:</strong> {sessionId ? '✅' : '❌'}</div>
          <div><strong>Auth:</strong> {isAuthenticated ? '✅' : '❌'}</div>
          
          {/* Debug de productos del último mensaje - Solo si existen */}
          {lastMessageProductsCount > 0 && (
            <div className="mt-1 pt-1 border-t border-yellow-300">
              <div className="font-semibold">📦 Productos:</div>
              {lastMessageProducts.slice(0, 2).map((product, index) => (
                <div key={index} className="truncate">• {product.name}</div>
              ))}
              {lastMessageProductsCount > 2 && (
                <div>... y {lastMessageProductsCount - 2} más</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chat Button Flotante */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 group ${
          isOpen 
            ? 'bg-gray-600 hover:bg-gray-700' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 animate-bounce'
        }`}
        aria-label="Chat de asistente de compras"
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          )}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">AI</span>
              </div>
              <div>
                <h3 className="font-semibold">Nexus AI Assistant</h3>
                <p className="text-xs opacity-90">
                  {isAuthenticated ? 'Conectado ✅' : 'Desconectado ❌'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 chat-scrollbar">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <p className="text-sm">¡Hola! Soy tu asistente de IA.</p>
                <p className="text-xs mt-1">Pregúntame sobre productos o recomiéndame algo.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage 
                  key={index} 
                  message={message} 
                  products={message.products}
                />
              ))
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 shadow-sm border">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">El asistente está escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pt-2 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 mb-2">💡 Prueba preguntando:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isTyping}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 border border-blue-200 hover:border-blue-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[40px]"
              >
                {isTyping ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};