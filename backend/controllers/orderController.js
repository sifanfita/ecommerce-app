import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
// All orders data for admin panel
const allOrders = async (req, res) => {};

// Get orders of a single user
const userOrders = async (req, res) => {
    try {

        const { userId } = req.body;
        const orders = await orderModel.find({ userId }).sort({ date: -1 });
        return res.json({
            success: true,
    
            data: orders
        })


        
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Error fetching user orders",
            error: error.message
        })



        
    }
};

// update order status (admin)
const updateOrderStatus = async (req, res) => {};

// place order (user)

const placeOrder = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const items = JSON.parse(req.body.items);
    const address = JSON.parse(req.body.address);

    // check for file
    const paymentProofFile = req.file;
    if (!paymentProofFile) {
      return res.json({
        success: false,
        message: "Payment proof is required",
      });
    }

    // upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      paymentProofFile.path,
      {
        resource_type: "image",
        folder: "paymentProofs",
      }
    );

    const paymentProofUrl = uploadResult.secure_url;

    // build order data
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
