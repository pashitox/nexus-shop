import { Router } from 'express';
import { ProductsController } from '../controllers/products.controller';
import { validateBody } from '../middleware/validation.middleware';
import { productSchema } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', ProductsController.getProducts);
router.get('/:id', ProductsController.getProductById);

// Protected routes (admin)
router.post('/', authenticateToken, validateBody(productSchema), ProductsController.createProduct);
router.put('/:id', authenticateToken, validateBody(productSchema), ProductsController.updateProduct);
router.delete('/:id', authenticateToken, ProductsController.deleteProduct);

export { router as productsRoutes };
