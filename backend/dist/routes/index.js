import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
import * as vehicleController from '../controllers/vehicleController.js';
import * as mediaController from '../controllers/mediaController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
const router = Router();
// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/vehicles/search', vehicleController.searchVehicles);
// Rotas públicas do catálogo
router.get('/public/catalog/:token', vehicleController.getPublicCatalog);
router.get('/public/catalog/:token/vehicles', vehicleController.getPublicVehicles);
router.get('/public/catalog/:token/vehicles/:id', vehicleController.getPublicVehicleById);
// Rotas protegidas - Usuários
router.use('/users', authenticate);
router.post('/users', authorize(['admin']), userController.createUser);
router.get('/users', authorize(['admin']), userController.getUsers);
router.put('/users/:id', authorize(['admin']), userController.updateUser);
router.delete('/users/:id', authorize(['admin']), userController.deleteUser);
// Rotas protegidas - Veículos
router.use('/vehicles', authenticate);
router.post('/vehicles/share-catalog', authorize(['admin', 'seller']), vehicleController.generatePublicCatalogToken);
router.post('/vehicles', authorize(['admin', 'seller']), vehicleController.createVehicle);
router.get('/vehicles', authorize(['admin', 'seller']), vehicleController.getVehicles);
router.get('/vehicles/:id', authorize(['admin', 'seller']), vehicleController.getVehicleById);
router.put('/vehicles/:id', authorize(['admin', 'seller']), vehicleController.updateVehicle);
router.delete('/vehicles/:id', authorize(['admin']), vehicleController.deleteVehicle);
// Rotas protegidas - Mídia
router.use('/media', authenticate);
router.post('/media/:vehicleId', authorize(['admin', 'seller']), mediaController.upload.array('files', 10), mediaController.uploadMedia);
router.delete('/media/:id', authorize(['admin', 'seller']), mediaController.deleteMedia);
export default router;
//# sourceMappingURL=index.js.map