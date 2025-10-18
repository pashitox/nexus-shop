import { Router } from 'express';
import { chatWithAssistant, startConversation } from '../controllers/assistant.controller';
import { authenticateToken } from '../middleware/auth.middleware';
const router = Router();

// POST /api/ai/chat - Chat con el asistente
router.post('/chat', authenticateToken, chatWithAssistant);

// GET /api/ai/start - Iniciar nueva conversación
router.get('/start', authenticateToken, startConversation);

export default router;