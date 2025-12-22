import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

// =======================
// ADMIN – GET ALL ORDERS
// =======================
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error fetching all orders",
    });
  }
};

// =======================
// USER – GET THEIR ORDERS
// =======================
const userOrders = async (req, res) => {
  try {
    const  userId  = req.user._id;

    if (!userId) {
      return res.json({
        success: false,
        message: "User ID missing",
      });
    }

    const orders = await orderModel.find({ userId }).sort({ date: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error fetching user orders",
    });
  }
};

// =======================
// ADMIN – UPDATE STATUS
// =======================
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(orderId, { status });

    res.json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error updating order status",
    });
  }
};

// =======================
// USER – PLACE ORDER
// =======================
const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = JSON.parse(req.body.items);
    const address = JSON.parse(req.body.address);
    const amount = req.body.amount;

    const paymentProofFile = req.file;
    if (!paymentProofFile) {
      return res.json({
        success: false,
        message: "Payment proof is required",
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      paymentProofFile.path,
      {
        resource_type: "image",
        folder: "paymentProofs",
      }
    );

    const paymentProofUrl = uploadResult.secure_url;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentProof: paymentProofUrl,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export { allOrders, userOrders, placeOrder, updateOrderStatus };
