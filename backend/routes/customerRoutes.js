import express from "express";
import { findUsersByRole, findUserById } from "../models/userModel.js";
import { getOrdersByUserId } from "../models/orderModel.js";
import adminOrShopkeeper from "../middleware/adminOrShopkeeper.js";
import authMiddleware from "../middleware/authMiddleware.js";

const customerRouter = express.Router();

customerRouter.get("/", authMiddleware, adminOrShopkeeper, async (req, res) => {
  try {

    const users = await findUsersByRole("user");

    const customers = await Promise.all(
      users.map(async (user) => {
        const orders = await getOrdersByUserId(user._id);

        
        // Get phone from first order's address if exists
        const phone = orders[0]?.address?.phone || "";

        // Collect all addresses from orders
        const addresses = orders.map((o) => o.address).filter(Boolean);

        return {
          _id: user._id,
         
          email: user.email,
          phone,
          addresses,
          orders,
          ordersCount: orders.length,
          totalSpent: orders.reduce((sum, o) => sum + o.amount, 0),
          joinedAt: user.created_at || null,
        };
      })
    );

    res.json({ success: true, customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


export default customerRouter;
