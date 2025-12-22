import express from 'express';
import {
  loginUser,
  adminLogin,
  shopkeeperLogin,
  registerUser,
  createShopkeeper,
  getShopkeepers,
  deleteShopkeeper,
} from "../controllers/userController.js";
import authMiddleware from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/admin/login", adminLogin);
userRouter.post("/shopkeeper/login", shopkeeperLogin);
userRouter.post("/register", registerUser);

userRouter.get("/admin/shopkeepers", authMiddleware, adminOnly, getShopkeepers);
userRouter.post("/admin/shopkeeper/create", authMiddleware, adminOnly, createShopkeeper);
userRouter.delete("/admin/shopkeeper/:id", authMiddleware, adminOnly, deleteShopkeeper);

export default userRouter;