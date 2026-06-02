import { getPool } from "../config/postgres.js";

// =======================
// SAFE JSON PARSER
// =======================
const safeParse = (value, fallback = []) => {
  try {
    if (typeof value === "string") return JSON.parse(value);
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

// =======================
// MAP ROW
// =======================
const mapProductRow = (row) => {
  if (!row) return null;

  return {
    ...row,
    _id: String(row.id),
    image: safeParse(row.image, []),
    colors: safeParse(row.colors, []),
  };
};

// =======================
// CREATE PRODUCT
// =======================
export const createProduct = async (data) => {
  const pool = await getPool();

  const {
    name,
    description,
    price,
    image,
    category,
    colors,
    bestSeller,
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO products
      (name, description, price, image, category, colors, best_seller)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      name,
      description,
      price,
      JSON.stringify(image ?? []),
      category,
      JSON.stringify(colors ?? []),
      Boolean(bestSeller),
    ]
  );

  return mapProductRow(rows[0]);
};

// =======================
// GET ALL PRODUCTS
// =======================
export const getAllProducts = async () => {
  const pool = await getPool();

  const { rows } = await pool.query(
    "SELECT * FROM products ORDER BY date DESC"
  );

  return rows.map(mapProductRow);
};

// =======================
// GET BY ID
// =======================
export const getProductById = async (id) => {
  const pool = await getPool();

  const { rows } = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [id]
  );

  return mapProductRow(rows[0]);
};

// =======================
// UPDATE COLORS
// =======================
export const updateProductColors = async (id, colors) => {
  const pool = await getPool();

  const { rows } = await pool.query(
    `UPDATE products
     SET colors = $1
     WHERE id = $2
     RETURNING *`,
    [
      JSON.stringify(colors ?? []),
      id,
    ]
  );

  return mapProductRow(rows[0]);
};