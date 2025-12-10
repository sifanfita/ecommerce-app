import express from "express";
import User from "../models/userModel.js"; // adjust path if needed
import Order from "../models/orderModel.js"; // optional, if you want order counts
import  adminAuth  from "../middleware/adminAuth.js"; // your admin auth middleware

const router = express.Router();

router.get("/", adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // exclude password

    const customers = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ userId: user._id });

        
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
          joinedAt: user.createdAt || user._id.getTimestamp(),
        };
      })
    );

    res.json({ success: true, customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


export default router;
