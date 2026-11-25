
import { getPool } from "../config/postgres.js";

// GET BRANDS
export const getAllBrands = async (includeInactive = false) => {
  const pool = await getPool();

  const query = includeInactive
    ? `SELECT * FROM brands ORDER BY name ASC`
    : `SELECT * FROM brands WHERE is_active = TRUE ORDER BY name ASC`;

  const { rows } = await pool.query(query);
  return rows;
};

// GET BRAND BY ID
export const getBrandById = async (id) => {
  const pool = await getPool();

  const { rows } = await pool.query(
    `SELECT * FROM brands WHERE id = $1`,
    [id]
  );

  return rows[0] || null;
};

// CREATE BRAND
export const createBrand = async ({ name, brandCode }) => {
  const pool = await getPool();

  const { rows } = await pool.query(
    `INSERT INTO brands (name, brand_code)
     VALUES ($1, $2)
     RETURNING *`,
    [name, brandCode]
  );

  return rows[0];
};

// UPDATE BRAND
export const updateBrand = async ({ id, name, brandCode }) => {
  const pool = await getPool();

  const { rows } = await pool.query(
    `UPDATE brands
     SET name = $1,
         brand_code = $2
     WHERE id = $3
     RETURNING *`,
    [name, brandCode, id]
  );

  return rows[0] || null;
};

// DEACTIVATE BRAND
export const deactivateBrand = async (id) => {
  const pool = await getPool();

  const { rows } = await pool.query(
    `UPDATE brands
     SET is_active = FALSE
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return rows[0] || null;
};

// REACTIVATE BRAND
export const reactivateBrand = async (id) => {
  const pool = await getPool();

  const { rows } = await pool.query(
    `UPDATE brands
     SET is_active = TRUE
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return rows[0] || null;
};
