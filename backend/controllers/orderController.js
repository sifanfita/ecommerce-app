import {
  createOrder,
  getAllOrders,
  getOrdersByUserId,
  updateOrderStatusById,
} from "../models/orderModel.js";
import { updateUserCart, findUserById } from "../models/userModel.js";
import { getProductById, updateProductColors } from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";


// =======================
// ADMIN – GET ALL ORDERS
// =======================
const allOrders = async (req, res) => {
  try {
    const orders = await getAllOrders();

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

    const orders = await getOrdersByUserId(Number(userId));

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

    await updateOrderStatusById(Number(orderId), status);

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

    const rawAmount = req.body.amount;
    const amountNumber = Number(rawAmount);
    const amount =
      Number.isFinite(amountNumber) && amountNumber > 0
        ? Math.round(amountNumber)
        : 0;

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
    // 2️⃣ Validate all items (do NOT change stock yet)
    // ==========================
    const validated = [];
    for (const item of items) {
      const product = await getProductById(Number(item.itemId));

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

      if (sizeData.stock < item.quantity) {
        return res.json({
          success: false,
          message: `${product.name} (${item.size}) is out of stock`,
        });
      }

      validated.push({ product, colorData, sizeData, item });
    }

    // ==========================
    // 3️⃣ Create order first (stock unchanged until order is saved)
    // ==========================
    const orderData = {
      userId: Number(userId),
      items,
      amount,
      address,
      paymentProof: paymentProofUrl,
      status: "Processing",
      date: Date.now(),
    };

    const newOrder = await createOrder(orderData);

    // ==========================
    // 4️⃣ Only now reduce stock (order was created successfully)
    // ==========================
    for (const { product, sizeData, item } of validated) {
      sizeData.stock -= item.quantity;
      await updateProductColors(product._id, product.colors);
    }

    // ==========================
    // 5️⃣ Clear Cart
    // ==========================
    await updateUserCart(Number(userId), {});


    // ==========================
    // 6️⃣ Response
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
