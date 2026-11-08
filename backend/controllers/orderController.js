import {
  createOrderWithStock,
  getAllOrders,
  getOrdersByUserId,
  updateOrderStatusWithStock,
  createPOSSale,
  getSalesHistory,
  getSalesAnalytics,


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

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    const updatedOrder = await updateOrderStatusWithStock(
      orderId,
      status
    );

    return res.json({
      success: true,
      message:
        status === "Cancelled"
          ? "Order cancelled and stock restored successfully"
          : "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.log("UPDATE ORDER STATUS ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Error updating order status",
    });
  }
};


// =======================
// USER – PLACE ORDER
// =======================
const placeOrder = async (req, res) => {
  let uploadResult;

  try {
    const userId = Number(req.user._id);

    let items;
    let address;

    try {
      items =
        typeof req.body.items === "string"
          ? JSON.parse(req.body.items)
          : req.body.items;

      address =
        typeof req.body.address === "string"
          ? JSON.parse(req.body.address)
          : req.body.address;
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid order data",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    if (!address || typeof address !== "object" || Array.isArray(address)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery information",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment proof is required",
      });
    }

    // Upload payment screenshot.
    uploadResult = await cloudinary.uploader.upload(
      req.file.path,
      {
        resource_type: "image",
        folder: "paymentProofs",
      }
    );

    // Backend calculates the total and deducts stock
    // inside one PostgreSQL transaction.
    const newOrder = await createOrderWithStock({
      userId,
      items,
      address,
      paymentProof: uploadResult.secure_url,
      status: "Order placed",
    });

    // Clear cart after successful order creation.
    try {
      await updateUserCart(userId, {});
    } catch (cartError) {
      console.log("CART CLEAR ERROR:", cartError);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.log("PLACE ORDER ERROR:", error);

    // Remove uploaded screenshot if database operation failed.
    if (uploadResult?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
      } catch (cleanupError) {
        console.log("PAYMENT PROOF CLEANUP ERROR:", cleanupError);
      }
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to place order",
    });
  }
};
// =======================
// POS – COMPLETE IN-PERSON SALE
// =======================
const completePOSSale = async (req, res) => {
  try {
    const sellerId = Number(req.user._id);

    let items = req.body.items;

    if (typeof items === "string") {
      items = JSON.parse(items);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add products to the sale",
      });
    }

    const sale = await createPOSSale({
      sellerId,
      items,
    });

    return res.status(201).json({
      success: true,
      message: "Sale completed successfully",
      sale,
    });
  } catch (error) {
    console.error("POS SALE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to complete sale",
    });
  }
};


const salesHistory = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type = "All",
    } = req.query;

    if (!["All", "Online", "POS"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sale type",
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (
      (startDate && !dateRegex.test(startDate)) ||
      (endDate && !dateRegex.test(endDate))
    ) {
      return res.status(400).json({
        success: false,
        message: "Dates must use YYYY-MM-DD format",
      });
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    const result = await getSalesHistory({
      startDate: startDate || null,
      endDate: endDate || null,
      type,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("SALES HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales history",
    });
  }
};

// =======================
// ADMIN – DASHBOARD ANALYTICS
// =======================
const salesAnalytics = async (req, res) => {
  try {
    let {
      startDate,
      endDate,
      groupBy = "day",
    } = req.query;

    // Default: Last 30 days
    const today = new Date();

    const formatDate = (date) => {
      return date.toISOString().split("T")[0];
    };

    if (!endDate) {
      endDate = formatDate(today);
    }

    if (!startDate) {
      const start = new Date(today);
      start.setUTCDate(start.getUTCDate() - 29);
      startDate = formatDate(start);
    }

    // Validate grouping
    if (!["day", "week", "month"].includes(groupBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid grouping. Use day, week, or month",
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    const isValidDate = (value) => {
      if (!dateRegex.test(value)) return false;

      const date = new Date(`${value}T00:00:00.000Z`);

      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    };

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Dates must be valid and use YYYY-MM-DD format",
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    const result = await getSalesAnalytics({
      startDate,
      endDate,
      groupBy,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("SALES ANALYTICS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales analytics",
    });
  }
};



export {
  allOrders,
  userOrders,
  placeOrder,
  updateOrderStatus,
  completePOSSale,
  salesHistory,
  salesAnalytics,
};
