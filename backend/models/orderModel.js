import { getPool } from "../config/postgres.js";

const mapOrderRow = (row) => {
  if (!row) return null;

  const parsedItems =
    row.items == null
      ? []
      : typeof row.items === "string"
      ? JSON.parse(row.items)
      : row.items;

  const parsedAddress =
    row.address == null
      ? {}
      : typeof row.address === "string"
      ? JSON.parse(row.address)
      : row.address;
  let normalizedDate = null;
  if (row.date != null) {
    if (row.date instanceof Date) {
      normalizedDate = row.date.toISOString();
    } else if (typeof row.date === "number") {
      const d = new Date(row.date);
      normalizedDate = Number.isNaN(d.getTime()) ? null : d.toISOString();
    } else if (typeof row.date === "string") {
      // Handle legacy millisecond timestamps stored as plain digits
      if (/^\d+$/.test(row.date)) {
        const d = new Date(Number(row.date));
        normalizedDate = Number.isNaN(d.getTime()) ? null : d.toISOString();
      } else {
        const d = new Date(row.date);
        normalizedDate = Number.isNaN(d.getTime()) ? null : d.toISOString();
      }
    }
  }

  return {
    ...row,
    _id: String(row.id),
    userId: String(row.user_id),
    items: parsedItems,
    amount: Number(row.amount),
    address: parsedAddress,
    date: normalizedDate,
    paymentProof: row.payment_proof,
  };
};

export const createOrder = async ({
  userId,
  items,
  amount,
  address,
  paymentProof,
  status = "Order placed",
  date,
}) => {
  const pool = await getPool();

  const itemsJson = JSON.stringify(items ?? []);
  const addressJson = JSON.stringify(address ?? {});

  const { rows } = await pool.query(
    `INSERT INTO orders
      (user_id, items, amount, address, status, payment_proof, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, itemsJson, amount, addressJson, status, paymentProof, date]
  );
  return mapOrderRow(rows[0]);
};

export const getAllOrders = async () => {
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT * FROM orders ORDER BY date DESC"
  );
  return rows.map(mapOrderRow);
};

export const getOrdersByUserId = async (userId) => {
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT * FROM orders WHERE user_id = $1 ORDER BY date DESC",
    [userId]
  );
  return rows.map(mapOrderRow);
};

export const updateOrderStatusById = async (orderId, status) => {
  const pool = await getPool();
  const { rows } = await pool.query(
    `UPDATE orders
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, orderId]
  );
  return mapOrderRow(rows[0]);
};

