import { useState, useCallback, useEffect } from 'react';
import { AIMessage, AIResponse, Product } from '../types/ai.types';

interface UseChatAssistant {
  messages: AIMessage[];
  isTyping: boolean;
  sessionId: string | null;
  isAuthenticated: boolean;
  startChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  resetChat: () => void;
}

// Función para verificar autenticación
const checkAuthStatus = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    return !isExpired;
  } catch {
    return false;
  }
};

// 🔥 NUEVA FUNCIÓN: Extraer solo la respuesta final (después del pensamiento)
const extractFinalResponse = (message: string): string => {
  console.log('📝 Procesando mensaje completo:', message);
  
  // Buscar patrones comunes donde termina el pensamiento y empieza la respuesta
  const patterns = [
    /\n\n¡/, // Doble salto de línea seguido de ¡ (español)
    /\n\n\*/, // Doble salto de línea seguido de * (markdown)
    /\n\n[A-Z]/, // Doble salto de línea seguido de mayúscula
    /¡[A-Z]/, // ¡ seguido de mayúscula (inicio de respuesta en español)
    /Okay, [^]+?\n\n([^]+)/, // Patrón común en inglés
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match.index) {
      const finalResponse = message.substring(match.index).trim();
      console.log('✅ Respuesta final extraída:', finalResponse);
      return finalResponse;
    }
  }

  // Si no encontramos patrón, buscar la última parte después de doble salto de línea
  const lastDoubleNewline = message.lastIndexOf('\n\n');
  if (lastDoubleNewline !== -1) {
    const finalResponse = message.substring(lastDoubleNewline + 2).trim();
    console.log('✅ Respuesta final (última parte):', finalResponse);
    return finalResponse;
  }

  // Si todo falla, devolver el mensaje completo pero limpiado
  console.log('⚠️ Usando mensaje completo (sin filtro)');
  return message.replace(/Okay, [^]+?\.\s+/g, '').trim();
};

export const useChatAssistant = (): UseChatAssistant => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación en tiempo real
  useEffect(() => {
    const updateAuthStatus = () => {
      const authStatus = checkAuthStatus();
      setIsAuthenticated(authStatus);
      console.log('🔐 Authentication status:', authStatus);
    };

    updateAuthStatus();

    const handleStorageChange = () => updateAuthStatus();
    const handleAuthChange = () => updateAuthStatus();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    
    const interval = setInterval(updateAuthStatus, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  const startChat = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        console.warn('User not authenticated - cannot start chat');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found in localStorage');
        return;
      }

      const newSessionId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      setMessages([{
        role: 'assistant',
        content: 'Hello! 👋 I am your personal NexusShop assistant. How can I help you today?',
        timestamp: new Date()
      }]);

      console.log('💬 Chat started with session:', newSessionId);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  }, [isAuthenticated]);

  const sendMessage = useCallback(async (message: string) => {
    // Verificar autenticación antes de enviar
    if (!isAuthenticated) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🔐 Please log in to use the AI assistant.',
        timestamp: new Date()
      }]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessages(prev => [...prev, {
        role: 'assistant', 
        content: '❌ Authentication error. Please reload the page.',
        timestamp: new Date()
      }]);
      return;
    }

    if (!sessionId || !message.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: AIMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      console.log('📤 Sending message to AI:', message);
      
      const response = await fetch('http://localhost:5001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          sessionId
        })
      });

      console.log('📥 Server response:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data: AIResponse = await response.json();
      console.log('🤖 Full AI response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        const responseData = data.data || data;
        const fullMessage = responseData.message || data.message || 'No response';
        const products = responseData.recommendedProducts || data.recommendedProducts || [];

        console.log('📦 Products extracted:', products);
        console.log('💬 Full message:', fullMessage);

        // 🔥 CORRECCIÓN: Extraer solo la respuesta final
        const finalMessage = extractFinalResponse(fullMessage);

        const assistantMessage: AIMessage = {
          role: 'assistant',
          content: finalMessage,
          timestamp: new Date(),
          products: products
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.message || 'Error in AI response');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: '⚠️ Sorry, there was an error connecting to the assistant. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, isAuthenticated]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setIsTyping(false);
  }, []);

  return {
    messages,
    isTyping,
    sessionId,
    isAuthenticated,
    startChat,
    sendMessage,
    resetChat
  };
};