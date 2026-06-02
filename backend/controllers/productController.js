import { v2 as cloudinary } from "cloudinary";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductColors,
} from "../models/productModel.js";

// =======================
// ADD PRODUCT
// =======================
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      bestSeller,
      colors,
    } = req.body;

    const files = req.files || {};

    const images = [
      files.image1?.[0],
      files.image2?.[0],
      files.image3?.[0],
      files.image4?.[0],
    ].filter(Boolean);

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // Upload images
    const imageUrls = await Promise.all(
      images.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    // Parse colors safely
    let parsedColors = [];

    try {
      const normalized =
        typeof colors === "string" ? JSON.parse(colors) : colors;

      if (!Array.isArray(normalized)) {
        return res.status(400).json({
          success: false,
          message: "Colors must be an array",
        });
      }

      parsedColors = normalized;
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON in colors field",
      });
    }

    // FINAL PRODUCT OBJECT (NO DATE HERE ❌)
    const productData = {
      name,
      description,
      price: Number(price),
      category,
      colors: parsedColors,
      bestSeller: bestSeller === "true",
      image: imageUrls,
    };

    const product = await createProduct(productData);

    return res.json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.log("🔥 SERVER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// LIST PRODUCTS
// =======================
const listProducts = async (req, res) => {
  try {
    const products = await getAllProducts();

    const availableProducts = products.filter((product) =>
      product.colors?.some((color) =>
        color.sizes?.some((size) => size.stock > 0)
      )
    );

    res.json({
      success: true,
      data: availableProducts,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// SINGLE PRODUCT
// =======================
const singleProduct = async (req, res) => {
  try {
    const { id } = req.body;

    const product = await getProductById(Number(id));

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    const hasStock = product.colors?.some((color) =>
      color.sizes?.some((size) => size.stock > 0)
    );

    if (!hasStock) {
      return res.json({
        success: false,
        message: "Product is out of stock",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// UPDATE STOCK
// =======================
const updateStock = async (req, res) => {
  try {
    const { productId, color, size, stock } = req.body;

    if (typeof stock !== "number" || stock < 0) {
      return res.json({
        success: false,
        message: "Stock must be a non-negative number",
      });
    }

    const product = await getProductById(Number(productId));

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    const colorEntry = product.colors.find((c) => c.color === color);
    if (!colorEntry) {
      return res.json({
        success: false,
        message: "Color not found",
      });
    }

    const sizeEntry = colorEntry.sizes.find((s) => s.size === size);
    if (!sizeEntry) {
      return res.json({
        success: false,
        message: "Size not found",
      });
    }

    sizeEntry.stock = stock;

    await updateProductColors(product._id, product.colors);

    res.json({
      success: true,
      message: "Stock updated successfully",
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
};

export { addProduct, listProducts, singleProduct, updateStock };