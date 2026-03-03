import jwt from "jsonwebtoken";
import { findUserById } from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];


    if (!token) {
      return res.json({
        success: false,
        message: "Not authorized, Login required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await findUserById(decoded.id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user; // 🔑 important
    next();
  } catch (error) {
    return res.json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
