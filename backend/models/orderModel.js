import { getPool } from "../config/postgres.js";

const mapOrderRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: String(row.id),
    userId: String(row.user_id),
    items: row.items || [],
    amount: Number(row.amount),
    address: row.address || {},
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
  const { rows } = await pool.query(
    `INSERT INTO orders
      (user_id, items, amount, address, status, payment_proof, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, items, amount, address, status, paymentProof, date]
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

