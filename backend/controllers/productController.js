import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, bestSeller, colors } = req.body;

    // Extract uploaded images
    const image1 = req.files.image1?.[0];
    const image2 = req.files.image2?.[0];
    const image3 = req.files.image3?.[0];
    const image4 = req.files.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    // Parse colors JSON (each color has sizes with stock)
    let parsedColors;
    try {
      parsedColors = JSON.parse(colors);
      if (!Array.isArray(parsedColors)) {
        throw new Error("colors must be an array");
      }
      // Optional: Validate that each color has name and sizes
      parsedColors.forEach((c) => {
        if (!c.color || !Array.isArray(c.sizes)) {
          throw new Error(
            "Each color must have 'color' and 'sizes' array"
          );
        }
      });
    } catch (err) {
      return res.json({
        success: false,
        message:
          "Invalid colors format — must be JSON array of {color, sizes:[{size, stock}]}",
      });
    }

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      colors: parsedColors, // <-- store colors with sizes & stock
      bestSeller: bestSeller === "true",
      date: Date.now(),
      image: imageUrls,
    };

    // Save to DB
    const product = new productModel(productData);
    await product.save();

    res.json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};


// function for get all products
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// function for get single product
const singleProduct = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await productModel.findById(id);
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Update stock for a specific color + size
const updateStock = async (req, res) => {
  try {
    const { productId, color, size, stock } = req.body;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    const colorEntry = product.colors.find(c => c.color === color);
    if (!colorEntry) {
      return res.json({ success: false, message: "Color not found" });
    }

    const sizeEntry = colorEntry.sizes.find(s => s.size === size);
    if (!sizeEntry) {
      return res.json({ success: false, message: "Size not found" });
    }

    sizeEntry.stock = stock; // update stock number

    await product.save();

    res.json({ success: true, message: "Stock updated successfully" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};


export { addProduct, listProducts, singleProduct, updateStock };
