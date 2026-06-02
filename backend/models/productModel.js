import { getPool } from "../config/postgres.js";

// =======================
const safeParse = (v, fallback = []) => {
  try {
    if (typeof v === "string") return JSON.parse(v);
    return v ?? fallback;
  } catch {
    return fallback;
  }
};

// =======================
const mapRow = (row) => {
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
     VALUES ($1,$2,$3,$4,$5,$6,$7)
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

  return mapRow(rows[0]);
};

// =======================
export const getAllProducts = async () => {
  const pool = await getPool();

  const { rows } = await pool.query(
    "SELECT * FROM products ORDER BY date DESC"
  );

  return rows.map(mapRow);
};

// =======================
export const getProductById = async (id) => {
  const pool = await getPool();

  const { rows } = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [id]
  );

  return mapRow(rows[0]);
};

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

  return mapRow(rows[0]);
};