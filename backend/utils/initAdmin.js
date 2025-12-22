import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";

const initAdmin = async () => {
  try {
    const adminExists = await userModel.findOne({ role: "admin" });

    if (adminExists) {
      console.log("✅ Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      10
    );

    await userModel.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    console.log("🚀 Admin account created successfully");
  } catch (error) {
    console.error("❌ Failed to initialize admin:", error.message);
  }
};

export default initAdmin;
