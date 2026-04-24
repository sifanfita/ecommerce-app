import { v2 as cloudinary } from "cloudinary";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductColors,
} from "../models/productModel.js";

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

    // 🔥 SAFE FILE ACCESS
    const files = req.files || {};

    const image1 = files.image1?.[0];
    const image2 = files.image2?.[0];
    const image3 = files.image3?.[0];
    const image4 = files.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    // 🔥 GUARD CLAUSE (IMPORTANT)
    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const imageUrls = await Promise.all(
      images.map(async (item) => {
        if (!item?.path) {
          throw new Error("Invalid image file");
        }

        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });

        return result.secure_url;
      })
    );

    // 🔥 SAFE COLORS PARSING
    let parsedColors;

    try {
      if (!colors) {
        throw new Error("Colors is required");
      }

      const normalized =
        typeof colors === "string" ? JSON.parse(colors) : colors;

      if (!Array.isArray(normalized)) {
        throw new Error("Colors must be an array");
      }

      parsedColors = normalized;
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid colors format",
        error: err.message,
      });
    }

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      colors: parsedColors,
      bestSeller: bestSeller === "true",
      date: Date.now(),
      image: imageUrls,
    };

    const product = await createProduct(productData);

    return res.json({
      success: true,
      message: "Product added successfully",
      data: product,
    });

  } catch (error) {
    console.log("🔥 SERVER ERROR:", error); // IMPORTANT
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// function for get all products (ONLY AVAILABLE ONES)
const listProducts = async (req, res) => {
  try {
    const products = await getAllProducts();

    // 🔥 Filter products with at least one size in stock
    const availableProducts = products.filter((product) => {
      return product.colors.some((color) =>
        color.sizes.some((size) => size.stock > 0)
      );
    });

    res.json({
      success: true,
      data: availableProducts,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};


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

    const hasStock = product.colors.some((color) =>
      color.sizes.some((size) => size.stock > 0)
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

    // ✅ Validate stock
    if (typeof stock !== "number" || stock < 0) {
      return res.json({
        success: false,
        message: "Stock must be a non-negative number",
      });
    }

    const product = await getProductById(Number(productId));
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    const colorEntry = product.colors.find((c) => c.color === color);
    if (!colorEntry) {
      return res.json({ success: false, message: "Color not found" });
    }

    const sizeEntry = colorEntry.sizes.find((s) => s.size === size);
    if (!sizeEntry) {
      return res.json({ success: false, message: "Size not found" });
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
