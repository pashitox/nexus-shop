import { Router } from 'express';
import { AddressesController } from '../controllers/addresses.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get('/', AddressesController.getAddresses);
router.post('/', AddressesController.createAddress);
router.put('/:id', AddressesController.updateAddress);
router.delete('/:id', AddressesController.deleteAddress);
router.put('/:id/default', AddressesController.setDefaultAddress);

export { router as addressesRoutes };
