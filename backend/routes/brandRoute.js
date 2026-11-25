
import express from "express";

import {
  listBrands,
  addBrand,
  editBrand,
  removeBrand,
  restoreBrand,
} from "../controllers/brandController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminOrShopkeeper from "../middleware/adminOrShopkeeper.js";

const brandRouter = express.Router();

// All brand management routes require authentication
brandRouter.use(authMiddleware, adminOrShopkeeper);

// Get active brands, or all brands with ?includeInactive=true
brandRouter.get("/list", listBrands);

// Add brand
brandRouter.post("/add", addBrand);

// Update brand
brandRouter.put("/update/:id", editBrand);

// Deactivate brand
brandRouter.put("/deactivate/:id", removeBrand);

// Reactivate brand
brandRouter.put("/reactivate/:id", restoreBrand);

export default brandRouter;
