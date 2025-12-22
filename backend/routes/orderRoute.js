import express from "express";
import {
  allOrders,
  userOrders,
  placeOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import adminOnly from "../middleware/adminOnly.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";
import adminOrShopkeeper from "../middleware/adminOrShopkeeper.js";

const orderRouter = express.Router();

// Admin routes
orderRouter.post("/list", authMiddleware, adminOrShopkeeper, allOrders); // GET for admin
orderRouter.post("/status", authMiddleware, adminOrShopkeeper, updateOrderStatus);

// User routes
orderRouter.post("/place", upload.single("paymentProof"), authMiddleware, placeOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);

export default orderRouter;
