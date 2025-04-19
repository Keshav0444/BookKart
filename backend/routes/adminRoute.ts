import express from 'express';
import * as adminController from '../controllers/adminController';
import { authenticateUser } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/adminMiddleware';

const router = express.Router();

router.get('/dashboard-stats', adminController.getDashboardStats)

//Apply both middleware to all admin route
router.use(authenticateUser, isAdmin)
//other maganemnt route
router.get('/orders',  adminController.getAllOrders);
router.put('/orders/:id', adminController.updateOrder);

//seller payment managemnet route
router.post('/process-seller-payment/:orderId', adminController.processSellerPayment);
router.get('/seller-payments', adminController.getSellerPayment);

export default router;