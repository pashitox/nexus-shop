import { Router } from 'express';
import { OrdersController } from '../controllers/orders.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Payment intent (público para guest checkout)
router.post('/payment-intent', OrdersController.createPaymentIntent);

// Nueva ruta para órdenes de guest
router.get('/guest/:email', OrdersController.getGuestOrders);

// Rutas protegidas
router.post('/', optionalAuth, OrdersController.createOrder);
router.get('/', authenticateToken, OrdersController.getOrders);
router.get('/:id', optionalAuth, OrdersController.getOrderById);
router.put('/:id/status', authenticateToken, OrdersController.updateOrderStatus);

export { router as ordersRoutes };
