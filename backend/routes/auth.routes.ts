import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody, loginSchema, registerSchema } from '../middleware/validation.middleware';

const router = Router();

//
// 🟢 Rutas públicas
//
router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/google', AuthController.googleAuth);

//
// 🔒 Rutas protegidas
//
router.get('/profile', authenticateToken, AuthController.getProfile);
router.post('/logout', authenticateToken, AuthController.logout);
router.post('/refresh', authenticateToken, AuthController.refreshToken);

//
// 📤 Exportar router
//
export { router as authRoutes };
