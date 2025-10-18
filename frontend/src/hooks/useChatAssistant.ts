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
      console.log('🔐 Estado de autenticación:', authStatus);
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
        console.warn('Usuario no autenticado - no se puede iniciar chat');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en localStorage');
        return;
      }

      const newSessionId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      setMessages([{
        role: 'assistant',
        content: '¡Hola! 👋 Soy tu asistente personal de NexusShop. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date()
      }]);

      console.log('💬 Chat iniciado con session:', newSessionId);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  }, [isAuthenticated]);

  const sendMessage = useCallback(async (message: string) => {
    // Verificar autenticación antes de enviar
    if (!isAuthenticated) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🔐 Por favor, inicia sesión para usar el asistente de IA.',
        timestamp: new Date()
      }]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessages(prev => [...prev, {
        role: 'assistant', 
        content: '❌ Error de autenticación. Por favor, recarga la página.',
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
      console.log('📤 Enviando mensaje a IA:', message);
      
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

      console.log('📥 Respuesta del servidor:', response.status);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data: AIResponse = await response.json();
      console.log('🤖 Respuesta IA recibida COMPLETA:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        // 🔥 CORRECCIÓN CRÍTICA: La estructura real es data.data.message y data.data.recommendedProducts
        const responseData = data.data || data;
        const messageContent = responseData.message || data.message || 'No response';
        const products = responseData.recommendedProducts || data.recommendedProducts || [];

        console.log('📦 Productos extraídos:', products);
        console.log('💬 Mensaje extraído:', messageContent);

        const assistantMessage: AIMessage = {
          role: 'assistant',
          content: messageContent,
          timestamp: new Date(),
          products: products
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.message || 'Error en la respuesta de IA');
      }
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: '⚠️ Lo siento, hubo un error al conectar con el asistente. Por favor, intenta nuevamente.',
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