'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatAssistant } from '../../hooks/useChatAssistant';
import { ChatMessage } from './ChatMessage';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  
  const { messages, isTyping, sessionId, isAuthenticated, startChat, sendMessage } = useChatAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && isAuthenticated && !sessionId) {
      console.log('🔄 Starting chat automatically...');
      startChat();
    }
  }, [isOpen, isAuthenticated, sessionId, startChat]);

  // 🔥 NUEVO: Auto-ocultar cuando el mouse no está encima
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    const chatWindow = chatWindowRef.current;
    if (chatWindow) {
      chatWindow.addEventListener('mouseenter', handleMouseEnter);
      chatWindow.addEventListener('mouseleave', handleMouseLeave);
    }

    // Auto-ocultar después de 5 segundos si no hay hover
    const autoHideTimer = setTimeout(() => {
      if (!isHovering) {
        setIsOpen(false);
      }
    }, 5000);

    return () => {
      if (chatWindow) {
        chatWindow.removeEventListener('mouseenter', handleMouseEnter);
        chatWindow.removeEventListener('mouseleave', handleMouseLeave);
      }
      clearTimeout(autoHideTimer);
    };
  }, [isOpen, isHovering]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('🔐 Please log in to use the AI assistant.');
      return;
    }

    if (!inputMessage.trim() || isTyping) return;

    await sendMessage(inputMessage);
    setInputMessage('');
    
    // 🔥 Reset hover timer cuando se envía un mensaje
    setIsHovering(true);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (!isAuthenticated) {
      alert('🔐 Please log in to use the AI assistant.');
      return;
    }
    await sendMessage(suggestion);
    
    // 🔥 Reset hover timer cuando se hace click en sugerencia
    setIsHovering(true);
  };

  const toggleChat = () => {
    if (!isAuthenticated) {
      alert('🔐 Please log in to chat with our AI assistant.');
      return;
    }
    
    setIsOpen(!isOpen);
    setIsHovering(true); // 🔥 Mantener visible cuando el usuario abre manualmente
    
    if (!isOpen && !sessionId) {
      startChat();
    }
  };

  // Quick suggestions
  const quickSuggestions = [
    "Recommend an elegant smartphone",
    "I have a $2000 budget",
    "I need casual clothing", 
    "What electronics do you have?",
    "I'm looking for a special gift"
  ];

  // Safe variables for debug
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMessageContent = lastMessage?.content || '';
  const lastMessageProducts = lastMessage?.products || [];
  const lastMessageProductsCount = lastMessageProducts.length;

  // Don't show button if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* 🔥 DEBUG PANEL - Optional: comment out if not needed */}
      {messages.length > 0 && (
        <div className="fixed top-4 left-4 bg-yellow-100 border border-yellow-400 rounded p-2 text-xs z-50 shadow-lg max-w-xs">
          <div className="font-bold text-yellow-800 mb-1">🐛 DEBUG CHAT</div>
          <div><strong>Messages:</strong> {messages.length}</div>
          <div><strong>Last:</strong> {lastMessageContent.substring(0, 30)}{lastMessageContent.length > 30 ? '...' : ''}</div>
          <div><strong>Last Products:</strong> {lastMessageProductsCount}</div>
          <div><strong>Typing:</strong> {isTyping ? '✅' : '❌'}</div>
          <div><strong>Session:</strong> {sessionId ? '✅' : '❌'}</div>
          <div><strong>Auth:</strong> {isAuthenticated ? '✅' : '❌'}</div>
          
          {/* Products debug - Only if they exist */}
          {lastMessageProductsCount > 0 && (
            <div className="mt-1 pt-1 border-t border-yellow-300">
              <div className="font-semibold">📦 Products:</div>
              {lastMessageProducts.slice(0, 2).map((product, index) => (
                <div key={index} className="truncate">• {product.name}</div>
              ))}
              {lastMessageProductsCount > 2 && (
                <div>... and {lastMessageProductsCount - 2} more</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 group ${
          isOpen 
            ? 'bg-gray-600 hover:bg-gray-700' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 animate-bounce'
        }`}
        aria-label="Shopping assistant chat"
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
        <div 
          ref={chatWindowRef}
          className="fixed bottom-20 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col animate-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">AI</span>
              </div>
              <div>
                <h3 className="font-semibold">Nexus AI Assistant</h3>
                <p className="text-xs opacity-90">
                  {isAuthenticated ? 'Connected ✅' : 'Disconnected ❌'}
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
                <p className="text-sm text-gray-700">Hello! I'm your AI assistant.</p>
                <p className="text-xs mt-1 text-gray-600">Ask me about products or ask for recommendations.</p>
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
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-700">Assistant is typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pt-2 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-600 mb-2">💡 Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isTyping}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 border border-blue-200 hover:border-blue-300"
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
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
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