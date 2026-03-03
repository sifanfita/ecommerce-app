import {
  findUserByEmail,
  findUserByPhone,
  findUserById,
  findUsersByRole,
  createUser,
  deleteUserById,
} from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/* ===========================
   JWT TOKEN GENERATOR
=========================== */
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* ===========================
   HELPER: SAFE QUERY BUILDER
=========================== */
const buildQuery = (email, phone) => {
  return { email, phone };
};

/* ===========================
   SHARED LOGIN LOGIC
=========================== */
const loginWithRole = async (req, res, allowedRole) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.json({ success: false, message: "Email or phone is required" });
    }

    const query = buildQuery(email, phone);

    let user = null;
    if (query.email) {
      user = await findUserByEmail(query.email);
    }
    if (!user && query.phone) {
      user = await findUserByPhone(query.phone);
    }

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.role !== allowedRole) {
      return res.json({
        success: false,
        message: `Access denied. Not a ${allowedRole}`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    const token = createToken(user);

    res.json({
      success: true,
      token,
      role: user.role,
      message: `${allowedRole} logged in successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
  success: false,
  message: error.message || "Login failed"
});

  }
};

/* ===========================
   USER LOGIN
=========================== */
const loginUser = async (req, res) => {
  await loginWithRole(req, res, "user");
};

/* ===========================
   ADMIN LOGIN
=========================== */
const adminLogin = async (req, res) => {
  await loginWithRole(req, res, "admin");
};

/* ===========================
   SHOPKEEPER LOGIN
=========================== */
const shopkeeperLogin = async (req, res) => {
  await loginWithRole(req, res, "shopkeeper");
};

/* ===========================
   REGISTER USER
=========================== */
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!email && !phone) {
      return res.json({ success: false, message: "Email or phone is required" });
    }

    if (email && !validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email" });
    }

    if (phone && phone.length < 9) {
      return res.json({ success: false, message: "Invalid phone number" });
    }

    if (!password || password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const query = buildQuery(email, phone);

    let exists = null;
    if (query.email) {
      exists = await findUserByEmail(query.email);
    }
    if (!exists && query.phone) {
      exists = await findUserByPhone(query.phone);
    }
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "user",
    });

    const token = createToken(user);

    res.json({
      success: true,
      token,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: "Registration failed",
    });
  }
};

/* ===========================
   CREATE SHOPKEEPER
=========================== */
const createShopkeeper = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    if (email && !validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email" });
    }

    if (!password || password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const query = buildQuery(email);

    let exists = null;
    if (query.email) {
      exists = await findUserByEmail(query.email);
    }
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const shopkeeper = await createUser({
      name,
      email,
      
      password: hashedPassword,
      role: "shopkeeper",
    });

    res.json({
      success: true,
      message: "Shopkeeper created successfully",
      shopkeeper,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to create shopkeeper" });
  }
};

/* ===========================
   GET SHOPKEEPERS
=========================== */
const getShopkeepers = async (req, res) => {
  try {
    const shopkeepers = await findUsersByRole("shopkeeper");

    res.json({ success: true, shopkeepers });
  } catch (error) {
    res.json({ success: false, message: "Failed to fetch shopkeepers" });
  }
};

/* ===========================
   DELETE SHOPKEEPER
=========================== */
const deleteShopkeeper = async (req, res) => {
  try {
    const { id } = req.params;

    const shopkeeper = await findUserById(Number(id));

    if (!shopkeeper || shopkeeper.role !== "shopkeeper") {
      return res.json({ success: false, message: "Shopkeeper not found" });
    }
    await deleteUserById(Number(id));

    res.json({
      success: true,
      message: "Shopkeeper deleted successfully",
    });
  } catch (error) {
    res.json({ success: false, message: "Failed to delete shopkeeper" });
  }
};

/* ===========================
   EXPORTS
=========================== */
export {
  loginUser,
  adminLogin,
  shopkeeperLogin,
  registerUser,
  createShopkeeper,
  getShopkeepers,
  deleteShopkeeper,
};
