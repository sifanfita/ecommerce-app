import express from "express";
import {
  allOrders,
  userOrders,
  placeOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const orderRouter = express.Router();

// Admin routes
orderRouter.post("/list", adminAuth, allOrders); // GET for admin
orderRouter.post("/status", adminAuth, updateOrderStatus);

// User routes
orderRouter.post("/place", upload.single("paymentProof"), authUser, placeOrder);
orderRouter.post("/userorders", authUser, userOrders);

export default orderRouter;
