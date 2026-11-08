
import { getPool } from "../config/postgres.js";

// Safely parse PostgreSQL JSON values
const safeParse = (value, fallback = []) => {
  try {
    if (typeof value === "string") return JSON.parse(value);
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

// Convert database rows into application product objects
const mapRow = (row) => {
  if (!row) return null;

  return {
    ...row,
    _id: String(row.id),
    price: Number(row.price),
    cost_price: Number(row.cost_price ?? 0),
    image: safeParse(row.image, []),
    colors: safeParse(row.colors, []),
  };
};

// CREATE PRODUCT
export const createProduct = async (data) => {
  const pool = await getPool();

  const {
    name,
    description,
    price,
    cost_price,
    image,
    category,
    colors,
    bestSeller,
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO products
      (name, description, price, cost_price, image, category, colors, best_seller)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      name,
      description,
      price,
      cost_price,
      JSON.stringify(image ?? []),
      category,
      JSON.stringify(colors ?? []),
      Boolean(bestSeller),
    ]
  );

  return mapRow(rows[0]);
};

// GET ALL PRODUCTS
export const getAllProducts = async () => {
  const pool = await getPool();

  const { rows } = await pool.query(
    "SELECT * FROM products ORDER BY date DESC"
  );

  return rows.map(mapRow);
};

// GET PRODUCT BY ID
export const getProductById = async (id) => {
  const pool = await getPool();

  const { rows } = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [id]
  );

  return mapRow(rows[0]);
};

// UPDATE PRODUCT COLORS / STOCK
export const updateProductColors = async (id, colors) => {
  const pool = await getPool();

  const { rows } = await pool.query(
    `UPDATE products
     SET colors = $1
     WHERE id = $2
     RETURNING *`,
    [JSON.stringify(colors ?? []), id]
  );

  return mapRow(rows[0]);
};


const normalizeVariant = (value) =>
  String(value ?? "").trim().toLowerCase();

// RESTOCK PRODUCT
export const restockProduct = async ({
  productId,
  color,
  size,
  quantity,
  purchaseCost,
  sellingPrice,
}) => {
  const pool = await getPool();
  const client = await pool.connect();

  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // Lock the product so another stock or price update
    // cannot interfere with this restock transaction.
    const { rows } = await client.query(
      `SELECT * FROM products WHERE id = $1 FOR UPDATE`,
      [productId]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return null;
    }

    const product = rows[0];
    const colors = safeParse(product.colors, []);

    if (!Array.isArray(colors)) {
      throw new Error("Invalid product variant data");
    }

    const colorEntry = colors.find(
      (entry) =>
        normalizeVariant(entry.color) === normalizeVariant(color)
    );

    if (!colorEntry) {
      throw new Error("Selected color was not found");
    }

    const sizeEntry = (colorEntry.sizes || []).find(
      (entry) =>
        normalizeVariant(entry.size) === normalizeVariant(size)
    );

    if (!sizeEntry) {
      throw new Error("Selected size was not found");
    }

    // Calculate total remaining stock across every variant.
    let oldTotalStock = 0;

    for (const colorItem of colors) {
      for (const sizeItem of colorItem.sizes || []) {
        const stock = Number(sizeItem.stock);

        if (!Number.isInteger(stock) || stock < 0) {
          throw new Error("Product contains invalid stock data");
        }

        oldTotalStock += stock;
      }
    }

    const currentVariantStock = Number(sizeEntry.stock);
    const newVariantStock = currentVariantStock + quantity;

    if (!Number.isSafeInteger(newVariantStock)) {
      throw new Error("Stock quantity is too large");
    }

    // Calculate weighted average cost in cents.
    const oldCostCents = Math.round(
      Number(product.cost_price ?? 0) * 100
    );

    const purchaseCostCents = Math.round(purchaseCost * 100);

    const newTotalStock = oldTotalStock + quantity;

    const newAverageCostCents =
      oldTotalStock === 0
        ? purchaseCostCents
        : Math.round(
            (
              oldTotalStock * oldCostCents +
              quantity * purchaseCostCents
            ) / newTotalStock
          );

    const newAverageCost = newAverageCostCents / 100;

    // Add stock only to the selected variant.
    sizeEntry.stock = newVariantStock;

    // Keep the current selling price unless a new one was provided.
    const updatedSellingPrice =
      sellingPrice === undefined || sellingPrice === null
        ? Number(product.price)
        : sellingPrice;

    const { rows: updatedRows } = await client.query(
      `UPDATE products
       SET colors = $1,
           cost_price = $2,
           price = $3
       WHERE id = $4
       RETURNING *`,
      [
        JSON.stringify(colors),
        newAverageCost,
        updatedSellingPrice,
        productId,
      ]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return mapRow(updatedRows[0]);
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    throw error;
  } finally {
    client.release();
  }
};
