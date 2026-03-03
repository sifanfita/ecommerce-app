import { getPool } from "../config/postgres.js";

const mapProductRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: String(row.id),
    image: row.image || [],
    colors: row.colors || [],
  };
};

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
    date,
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO products
      (name, description, price, image, category, colors, best_seller, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      name,
      description,
      price,
      image,
      category,
      JSON.stringify(colors ?? []),
      Boolean(bestSeller),
      date,
    ]
  );

  return mapProductRow(rows[0]);
};

export const getAllProducts = async () => {
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT * FROM products ORDER BY date DESC"
  );
  return rows.map(mapProductRow);
};

export const getProductById = async (id) => {
  const pool = await getPool();
  const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [
    id,
  ]);
  return mapProductRow(rows[0]);
};

export const updateProductColors = async (id, colors) => {
  const pool = await getPool();
  const { rows } = await pool.query(
    `UPDATE products
     SET colors = $1
     WHERE id = $2
     RETURNING *`,
    [JSON.stringify(colors ?? []), id]
  );
  return mapProductRow(rows[0]);
};

