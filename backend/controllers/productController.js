
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";
import { getBrandById } from "../models/brandModel.js";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductColors,
  restockProduct,
  getNextProductTag,
} from "../models/productModel.js";

// Generate a unique SKU
const generateSKU = () => {
  return `SKU-${randomUUID().slice(0, 8).toUpperCase()}`;
};

// Add missing SKUs while preserving existing ones
const assignVariantSKUs = (colors) => {
  return colors.map((colorEntry) => ({
    ...colorEntry,
    sizes: (colorEntry.sizes || []).map((sizeEntry) => ({
      ...sizeEntry,
      sku: sizeEntry.sku || generateSKU(),
    })),
  }));
};

// Convert category names into short product tag codes
const getCategoryCode = (category) => {
  const categoryCodes = {
    "t-shirt": "T",
    "shirt": "SH",
    "jacket": "J",
    "shoes": "SHO",
    "tuta": "TU",
    "trouser": "TR",
  };

  const normalized = String(category ?? "")
    .trim()
    .toLowerCase();

  return (
    categoryCodes[normalized] ||
    normalized.replace(/[^a-z0-9]/g, "").slice(0, 3).toUpperCase()
  );
};

// =======================
// ADD PRODUCT
// =======================
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      costPrice,
      category,
      bestSeller,
      colors,
      brandId,
    } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and category are required",
      });
    }

    const selectedBrandId = Number(brandId);

    if (!Number.isInteger(selectedBrandId) || selectedBrandId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid brand",
      });
    }

    const selectedBrand = await getBrandById(selectedBrandId);

    if (!selectedBrand || !selectedBrand.is_active) {
      return res.status(400).json({
        success: false,
        message: "Selected brand does not exist or is inactive",
      });
    }

    const sellingPrice = Number(price);
    const productCost = Number(costPrice);

    if (
      !Number.isFinite(sellingPrice) ||
      sellingPrice <= 0 ||
      !Number.isFinite(productCost) ||
      productCost < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter valid selling and cost prices",
      });
    }

    // Collect uploaded images
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

    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      images.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });

        return result.secure_url;
      })
    );

    // Parse colors
    let parsedColors;

    try {
      parsedColors =
        typeof colors === "string" ? JSON.parse(colors) : colors;

      if (!Array.isArray(parsedColors) || parsedColors.length === 0) {
        throw new Error("Colors must be a non-empty array");
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid colors data",
      });
    }

    // Validate and normalize variants
    for (const color of parsedColors) {
      if (
        !color.color ||
        !Array.isArray(color.sizes) ||
        color.sizes.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Each color must have at least one size",
        });
      }

      for (const size of color.sizes) {
        const stock = Number(size.stock);

        if (
          !size.size ||
          !Number.isInteger(stock) ||
          stock < 0
        ) {
          return res.status(400).json({
            success: false,
            message: "Each size must have a valid name and non-negative stock",
          });
        }

        size.stock = stock;
      }
    }

    // Generate a SKU for every color-size variant
    const colorsWithSKUs = assignVariantSKUs(parsedColors);

    // Validate and normalize the selected brand code
    const brandCode = String(selectedBrand.brand_code ?? "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (!brandCode) {
      return res.status(400).json({
        success: false,
        message: "The selected brand does not have a valid brand code",
      });
    }

    // Generate one product tag for the selected brand and category
    const categoryCode = getCategoryCode(category);

    if (!categoryCode) {
      return res.status(400).json({
        success: false,
        message: "The selected category does not have a valid code",
      });
    }

    const productTag = await getNextProductTag(
      brandCode,
      categoryCode
    );

    const productData = {
      name,
      description,
      price: sellingPrice,
      cost_price: productCost,
      category,
      brand_id: selectedBrandId,
      product_tag: productTag,
      colors: colorsWithSKUs,
      bestSeller: bestSeller === "true" || bestSeller === true,
      image: imageUrls,
    };

    const product = await createProduct(productData);

    return res.json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.log("ADD PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// LIST PRODUCTS FOR INVENTORY
// =======================
const listProducts = async (req, res) => {
  try {
    // Return ALL products, including completely out-of-stock products.
    // Inventory management needs to display those products too.
    const products = await getAllProducts();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// POS PRODUCT SEARCH
// =======================
const searchProducts = async (req, res) => {
  try {
    const query = req.query.query?.trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Please enter a product name, tag, or SKU",
      });
    }

    const products = await getAllProducts();

    const searchTerm = query.toLowerCase();

    const results = products
      .map((product) => {
        const nameMatches = product.name
          ?.toLowerCase()
          .includes(searchTerm);

        const tagMatches = product.product_tag
          ?.toLowerCase()
          .includes(searchTerm);

        // Keep only variants with available stock
        const availableColors = (product.colors || [])
          .map((colorEntry) => {
            const availableSizes = (colorEntry.sizes || [])
              .filter((sizeEntry) => {
                const hasStock = Number(sizeEntry.stock) > 0;

                // Search by product name, product tag, or variant SKU.
                // A name or tag match returns all available variants.
                const skuMatches = sizeEntry.sku
                  ?.toLowerCase()
                  .includes(searchTerm);

                return (
                  hasStock &&
                  (nameMatches || tagMatches || skuMatches)
                );
              })
              .map((sizeEntry) => ({
                size: sizeEntry.size,
                sku: sizeEntry.sku,
                stock: Number(sizeEntry.stock),
              }));

            return {
              color: colorEntry.color,
              sizes: availableSizes,
            };
          })
          .filter((colorEntry) => colorEntry.sizes.length > 0);

        // Exclude products without matching available variants
        if (availableColors.length === 0) {
          return null;
        }

        return {
          _id: product._id,
          name: product.name,
          product_tag: product.product_tag,
          description: product.description,
          image: product.image,
          category: product.category,

          // Default product prices
          price: Number(product.price),
          cost_price: Number(product.cost_price),

          colors: availableColors,
        };
      })
      .filter(Boolean);

    return res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.log("POS PRODUCT SEARCH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// GET SINGLE PRODUCT
// =======================
const singleProduct = async (req, res) => {
  try {
    const { id } = req.body;

    const product = await getProductById(Number(id));

    if (!product) {
      return res.json({
        success: false,
        message: "Not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
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

    const newStock = Number(stock);

    if (!Number.isInteger(newStock) || newStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative integer",
      });
    }

    const product = await getProductById(Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const colorEntry = product.colors.find(
      (entry) => entry.color === color
    );

    const sizeEntry = colorEntry?.sizes.find(
      (entry) => entry.size === size
    );

    if (!sizeEntry) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    // Only update stock. Existing SKU remains unchanged.
    sizeEntry.stock = newStock;

    const updatedProduct = await updateProductColors(
      product._id,
      product.colors
    );

    res.json({
      success: true,
      message: "Stock updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// RESTOCK PRODUCT
// =======================
const restock = async (req, res) => {
  try {
    const {
      productId,
      color,
      size,
      quantity,
      purchaseCost,
      sellingPrice,
    } = req.body;

    const id = Number(productId);
    const restockQuantity = Number(quantity);
    const cost = Number(purchaseCost);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!color?.trim() || !size?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Color and size are required",
      });
    }

    if (!Number.isInteger(restockQuantity) || restockQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Restock quantity must be a positive integer",
      });
    }

    if (!Number.isFinite(cost) || cost <= 0) {
      return res.status(400).json({
        success: false,
        message: "Purchase cost must be greater than zero",
      });
    }

    let newSellingPrice;

    if (
      sellingPrice !== undefined &&
      sellingPrice !== null &&
      sellingPrice !== ""
    ) {
      newSellingPrice = Number(sellingPrice);

      if (!Number.isFinite(newSellingPrice) || newSellingPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "Selling price must be greater than zero",
        });
      }
    }

    const updatedProduct = await restockProduct({
      productId: id,
      color,
      size,
      quantity: restockQuantity,
      purchaseCost: cost,
      sellingPrice: newSellingPrice,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      message: "Product restocked successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.log("RESTOCK PRODUCT ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to restock product",
    });
  }
};

export {
  addProduct,
  listProducts,
  singleProduct,
  updateStock,
  searchProducts,
  restock,
};
