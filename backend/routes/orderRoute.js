import express from "express";
import {
  allOrders,
  userOrders,
  placeOrder,
  updateOrderStatus,
  completePOSSale,
  salesHistory,
  salesAnalytics,

} from "../controllers/orderController.js";
import adminOnly from "../middleware/adminOnly.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";
import adminOrShopkeeper from "../middleware/adminOrShopkeeper.js";

const orderRouter = express.Router();

// Admin routes
orderRouter.post("/list", authMiddleware, adminOrShopkeeper, allOrders); // GET for admin
orderRouter.post("/status", authMiddleware, adminOrShopkeeper, updateOrderStatus);
// POS – Admin and shopkeeper
orderRouter.post(
  "/pos",
  authMiddleware,
  adminOrShopkeeper,
  completePOSSale
);
orderRouter.get(
  "/sales-history",
  authMiddleware,
  adminOrShopkeeper,
  salesHistory
);

orderRouter.get(
  "/sales-analytics",
  authMiddleware,
  adminOrShopkeeper,
  salesAnalytics
);

// User routes
orderRouter.post("/place",  authMiddleware,upload.single("paymentProof"), placeOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);

export default orderRouter;
