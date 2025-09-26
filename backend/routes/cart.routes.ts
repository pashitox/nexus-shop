import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

//
// 🛡️ Autenticación opcional para carrito (permite guest users)
//
router.use(optionalAuth);

//
// 🛒 Rutas del carrito
//
router.get('/', CartController.getCart);
router.post('/add', CartController.addToCart);
router.put('/:itemId', CartController.updateCartItem);
router.delete('/:itemId', CartController.removeFromCart);

//
// 🔗 Ruta para fusionar carritos (requiere autenticación)
//
router.post('/merge', authenticateToken, CartController.mergeCarts);

//
// 📤 Exportar router
//
export { router as cartRoutes };
