import { Request, Response } from 'express';
import { ShoppingAssistant } from '../utils/assistant';

const assistant = new ShoppingAssistant();

export const chatWithAssistant = async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { message, sessionId } = req.body;
    const userId = req.user?.id; // Del middleware de auth

    console.log('🎯 Mensaje recibido:', { message, sessionId, userId });

    if (!message || !sessionId) {
      console.warn('❌ Parámetros faltantes: message o sessionId');
      return res.status(400).json({
        success: false,
        message: 'Message and sessionId are required'
      });
    }

    const response = await assistant.processMessage(message, sessionId, userId);

    console.log('✅ Respuesta IA generada:', {
      success: response.success,
      productsSuggested: response.recommendedProducts?.length || 0,
      durationMs: Date.now() - startTime
    });

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('💥 Error en chatWithAssistant:', error instanceof Error ? error.stack : error);
    res.status(500).json({
      success: false,
      message: 'Error processing message'
    });
  }
};

export const startConversation = async (req: Request, res: Response) => {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    console.log('🆕 Nueva sesión iniciada:', { sessionId, userId: req.user?.id });

    res.json({
      success: true,
      data: {
        sessionId,
        welcomeMessage: "¡Hola! 👋 Soy tu asistente personal de NexusShop. ¿En qué puedo ayudarte hoy?",
        suggestions: [
          "Necesito un outfit para trabajo",
          "Busco un regalo especial",
          "Quiero algo casual para el día a día",
          "Recomiéndame electrónicos"
        ]
      }
    });
  } catch (error) {
    console.error('💥 Error en startConversation:', error instanceof Error ? error.stack : error);
    res.status(500).json({
      success: false,
      message: 'Error starting conversation'
    });
  }
};
