import express from 'express';
import { allOrders, userOrders,placeOrder, updateOrderStatus } from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const orderRouter = express.Router();


// Admin features
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateOrderStatus);

//payment features
orderRouter.post("/place", upload.single("paymentProof"), authUser, placeOrder);

// User features
orderRouter.post('/userorders', authUser, userOrders);

export default orderRouter;
