import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
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
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-frontend-domain.com",
    "http://localhost:5174",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));


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
    await connectDB();           // 1️⃣ Connect MongoDB
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
