import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectPostgres from './config/postgres.js';
import connectCloudinary from './config/cloudinary.js';

import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import customerRouter from "./routes/customerRoutes.js";

import initAdmin from "./utils/initAdmin.js";

const app = express();
const port = process.env.PORT || 9000;

// Middleware

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ecommerce-app-three-sage.vercel.app",
    "https://ecommerce-app-admin-delta.vercel.app",
    "https://ecommerce-app-shopkeeper.vercel.app",
    "http://localhost:5174",
    "http://localhost:5175",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  
}));

app.use(express.json());

// VERY IMPORTANT

app.use("/uploads", express.static("uploads"));

// Health Check Endpoint

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Routes

app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/customers', customerRouter);


app.get('/', (req, res) => {
  res.send("API is running...");
});

// 🔐 START SERVER PROPERLY
const startServer = async () => {
  try {
    await connectPostgres();     // 1️⃣ Connect PostgreSQL
    await connectCloudinary();   // 2️⃣ Connect Cloudinary
    await initAdmin();           // 3️⃣ Initialize admin safely

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
