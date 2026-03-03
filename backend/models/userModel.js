import { getPool } from "../config/postgres.js";

const mapUserRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    cartData: row.cart_data || {},
  };
};

export const findUserByEmail = async (email) => {
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email?.toLowerCase()]
  );
  return mapUserRow(rows[0]);
};

export const findUserByPhone = async (phone) => {
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE phone = $1 LIMIT 1",
    [phone]
  );
  return mapUserRow(rows[0]);
};

export const findUserById = async (id) => {
  const pool = await getPool();
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return mapUserRow(rows[0]);
};

export const findUsersByRole = async (role) => {
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT id, name, email, phone, role FROM users WHERE role = $1",
    [role]
  );
  return rows.map((row) => ({
    ...row,
    _id: row.id,
  }));
};

export const createUser = async ({
  name,
  email,
  phone,
  password,
  role = "user",
}) => {
  const pool = await getPool();
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, phone, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, email?.toLowerCase(), phone, password, role]
  );
  return mapUserRow(rows[0]);
};

export const deleteUserById = async (id) => {
  const pool = await getPool();
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
};

export const updateUserCart = async (userId, cartData) => {
  const pool = await getPool();
  const { rows } = await pool.query(
    `UPDATE users
     SET cart_data = $1
     WHERE id = $2
     RETURNING *`,
    [cartData || {}, userId]
  );
  return mapUserRow(rows[0]);
};

