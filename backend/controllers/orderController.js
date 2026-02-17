import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
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
    const userId = req.user._id;

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

    // ==========================
    // 1️⃣ Upload payment proof
    // ==========================
    const uploadResult = await cloudinary.uploader.upload(
      paymentProofFile.path,
      {
        resource_type: "image",
        folder: "paymentProofs",
      }
    );

    const paymentProofUrl = uploadResult.secure_url;


    // ==========================
    // 2️⃣ Update stock
    // ==========================
    for (const item of items) {

      const product = await productModel.findById(item.itemId);

      if (!product) {
        return res.json({
          success: false,
          message: "Product not found",
        });
      }

      const colorData = product.colors.find(
        (c) =>
          c.color.toLowerCase().trim() ===
          item.color.toLowerCase().trim()
      );

      if (!colorData) {
        return res.json({
          success: false,
          message: `Color not available for ${product.name}`,
        });
      }

      const sizeData = colorData.sizes.find(
        (s) =>
          s.size.toLowerCase().trim() ===
          item.size.toLowerCase().trim()
      );

      if (!sizeData) {
        return res.json({
          success: false,
          message: `Size not available for ${product.name}`,
        });
      }

      // Check stock
      if (sizeData.stock < item.quantity) {
        return res.json({
          success: false,
          message: `${product.name} (${item.size}) is out of stock`,
        });
      }

      // Reduce stock
      sizeData.stock -= item.quantity;

      await product.save();
    }


    // ==========================
    // 3️⃣ Create Order
    // ==========================
    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentProof: paymentProofUrl,
      status: "Processing",
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();


    // ==========================
    // 4️⃣ Clear Cart
    // ==========================
    await userModel.findByIdAndUpdate(userId, { cartData: {} });


    // ==========================
    // 5️⃣ Response
    // ==========================
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


export {
  allOrders,
  userOrders,
  placeOrder,
  updateOrderStatus,
};
