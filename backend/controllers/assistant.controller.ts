import { Request, Response } from 'express';
import { ShoppingAssistant } from '../utils/assistant';


const assistant = new ShoppingAssistant();

export const chatWithAssistant = async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?.id; // Del middleware de auth

    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Message and sessionId are required'
      });
    }

    const response = await assistant.processMessage(message, sessionId, userId);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI Assistant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing message'
    });
  }
};

export const startConversation = async (req: Request, res: Response) => {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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
    res.status(500).json({
      success: false,
      message: 'Error starting conversation'
    });
  }
};