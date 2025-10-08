// backend/src/routes/payments.routes.ts - VERSIÓN CORREGIDA
import { Router } from 'express';
import { PaymentsController } from '../controllers/payments.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Esquema de validación para checkout
const checkoutSchema = z.object({
  sessionId: z.string().min(1, 'SessionId es requerido'),
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Nombre completo es requerido'),
    street: z.string().min(5, 'Dirección es requerida'),
    city: z.string().min(2, 'Ciudad es requerida'),
    state: z.string().min(2, 'Estado es requerido'),
    postalCode: z.string().min(4, 'Código postal es requerido'),
    country: z.string().min(2, 'País es requerido'),
    phone: z.string().optional(),
  }).optional(),
  guestEmail: z.string().email().optional(),
  guestName: z.string().min(2).optional(),
});

// ✅ RUTAS CORREGIDAS - Asegurarse de que todas las funciones existan

// Checkout (público - para usuarios y guests)
router.post('/checkout', validateBody(checkoutSchema), PaymentsController.createCheckout);

// Webhook de Stripe (sin autenticación)
router.post('/webhook', PaymentsController.handleWebhook);

// Obtener estado de orden
router.get('/order-status/:orderId', PaymentsController.getOrderStatus);

// Ruta para obtener la última orden del usuario - ✅ CORREGIDA
router.get('/latest-order', authenticateToken, PaymentsController.getLatestOrder);

// Ruta de prueba
router.get('/test', PaymentsController.testPaymentSystem);

export { router as paymentsRoutes };