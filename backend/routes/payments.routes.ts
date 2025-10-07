import { Router } from 'express';
import { PaymentsController } from '../controllers/payments.controller';

const router = Router();

// Ruta de prueba
router.get('/test', PaymentsController.testPaymentSystem);

// Webhook de Stripe
router.post('/webhook', PaymentsController.handleWebhook);

export { router as paymentsRoutes };
