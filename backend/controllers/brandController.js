
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deactivateBrand,
  reactivateBrand,
} from "../models/brandModel.js";

// LIST BRANDS
const listBrands = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";

    const brands = await getAllBrands(includeInactive);

    return res.json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (error) {
    console.error("LIST BRANDS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve brands",
    });
  }
};

// ADD BRAND
const addBrand = async (req, res) => {
  try {
    const { name, brandCode } = req.body;

    const normalizedName = String(name ?? "").trim();
    const normalizedCode = String(brandCode ?? "")
      .trim()
      .toUpperCase();

    if (!normalizedName || !normalizedCode) {
      return res.status(400).json({
        success: false,
        message: "Brand name and brand code are required",
      });
    }

    if (normalizedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Brand name cannot exceed 100 characters",
      });
    }

    if (!/^[A-Z0-9]{1,10}$/.test(normalizedCode)) {
      return res.status(400).json({
        success: false,
        message: "Brand code must contain 1-10 letters or numbers",
      });
    }

    const brand = await createBrand({
      name: normalizedName,
      brandCode: normalizedCode,
    });

    return res.status(201).json({
      success: true,
      message: "Brand added successfully",
      data: brand,
    });
  } catch (error) {
    console.error("ADD BRAND ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Brand name or brand code already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add brand",
    });
  }
};

// UPDATE BRAND
const editBrand = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, brandCode } = req.body;

    const normalizedName = String(name ?? "").trim();
    const normalizedCode = String(brandCode ?? "")
      .trim()
      .toUpperCase();

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand ID",
      });
    }

    if (!normalizedName || !normalizedCode) {
      return res.status(400).json({
        success: false,
        message: "Brand name and brand code are required",
      });
    }

    if (normalizedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Brand name cannot exceed 100 characters",
      });
    }

    if (!/^[A-Z0-9]{1,10}$/.test(normalizedCode)) {
      return res.status(400).json({
        success: false,
        message: "Brand code must contain 1-10 letters or numbers",
      });
    }

    const existingBrand = await getBrandById(id);

    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const brand = await updateBrand({
      id,
      name: normalizedName,
      brandCode: normalizedCode,
    });

    return res.json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    console.error("UPDATE BRAND ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Brand name or brand code already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update brand",
    });
  }
};

// DEACTIVATE BRAND
const removeBrand = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand ID",
      });
    }

    const brand = await deactivateBrand(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.json({
      success: true,
      message: "Brand deactivated successfully",
      data: brand,
    });
  } catch (error) {
    console.error("DEACTIVATE BRAND ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate brand",
    });
  }
};

// REACTIVATE BRAND
const restoreBrand = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand ID",
      });
    }

    const brand = await reactivateBrand(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.json({
      success: true,
      message: "Brand reactivated successfully",
      data: brand,
    });
  } catch (error) {
    console.error("REACTIVATE BRAND ERROR:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A brand with this name or code already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to reactivate brand",
    });
  }
};

export {
  listBrands,
  addBrand,
  editBrand,
  removeBrand,
  restoreBrand,
};
