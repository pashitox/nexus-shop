import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody, loginSchema, registerSchema } from '../middleware/validation.middleware';

const router = Router();

//
// 🟢 Rutas públicas
//
router.get('/health', AuthController.health); // ✅ NUEVO: Health check
router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/google', AuthController.googleAuth);
router.post('/google/code', AuthController.googleAuthCode); // ✅ NUEVO: Para código OAuth

//
// 🔒 Rutas protegidas
//
router.get('/profile', authenticateToken, AuthController.getProfile);
router.get('/debug-token', authenticateToken, AuthController.debugToken);
router.post('/logout', authenticateToken, AuthController.logout);
router.post('/refresh', authenticateToken, AuthController.refreshToken);

export { router as authRoutes };