import express from 'express';
import { listProducts, addProduct, updateStock, singleProduct } from '../controllers/productController.js';
import upload from '../middleware/multer.js';

import authMiddleware from '../middleware/authMiddleware.js';
import adminOrShopkeeper from '../middleware/adminOrShopkeeper.js';


const productRouter = express.Router();

productRouter.get('/list', listProducts);
productRouter.post('/add', authMiddleware, adminOrShopkeeper, upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1}, {name: 'image4', maxCount: 1}]), addProduct);
productRouter.get('/single', singleProduct);
productRouter.put('/updateStock', authMiddleware, adminOrShopkeeper, updateStock);

export default productRouter;
