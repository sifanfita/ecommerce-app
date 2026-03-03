import bcrypt from "bcrypt";
import { findUsersByRole, createUser } from "../models/userModel.js";

const initAdmin = async () => {
  try {
    const admins = await findUsersByRole("admin");
    const adminExists = admins.length > 0;

    if (adminExists) {
      console.log("✅ Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      10
    );

    await createUser({
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
