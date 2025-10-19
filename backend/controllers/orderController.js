import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
// All orders data for admin panel
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
      error: error.message,
    });
  }
};

// Get orders of a single user
const userOrders = async (req, res) => {
  try {
    const userId = req.body.userId; // comes from authUser middleware

    if (!userId) {
      return res.json({
        success: false,
        message: "User ID not found in request (auth failed)",
      });
    }

    const orders = await orderModel.find({ userId }).sort({ date: -1 });

    return res.json({
      success: true,
     orders,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error fetching user orders",
      error: error.message,
    });
  }
};


// update order status (admin)
const updateOrderStatus = async (req, res) => {

  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    return res.json({
      success: true,
      message: "Order status updated"
    })
    
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error updating order status",
      error: error.message
    })
    
  }
};

// place order (user)
const placeOrder = async (req, res) => {
  try {
    const userId = req.body.userId; // added by authUser middleware
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

    const uploadResult = await cloudinary.uploader.upload(paymentProofFile.path, {
      resource_type: "image",
      folder: "paymentProofs",
    });

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
      message: "Error placing order",
      error: error.message,
    });
  }
};

export { allOrders, userOrders, placeOrder, updateOrderStatus };
