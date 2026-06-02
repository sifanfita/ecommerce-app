import { getPool } from "../config/postgres.js";

const initDatabase = async () => {
  const pool = await getPool();

  // USERS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      password TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      cart_data JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // PRODUCTS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL,
      image JSONB DEFAULT '[]'::jsonb,
      category VARCHAR(100),
      colors JSONB DEFAULT '[]'::jsonb,
      best_seller BOOLEAN DEFAULT FALSE,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ORDERS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      items JSONB DEFAULT '[]'::jsonb,
      amount NUMERIC(10,2) NOT NULL,
      address JSONB DEFAULT '{}'::jsonb,
      status VARCHAR(100) DEFAULT 'Order placed',
      payment_proof TEXT,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Database tables initialized");
};

export default initDatabase;