
import { getPool } from "../config/postgres.js";

const initDatabase = async () => {
  const pool = await getPool();

  // =========================
  // USERS
  // =========================
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

  // =========================
  // PRODUCTS
  // =========================
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

  // =========================
  // BRANDS
  // =========================
  await pool.query(`
    CREATE TABLE IF NOT EXISTS brands (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      brand_code VARCHAR(10) NOT NULL UNIQUE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // =========================
  // PRODUCT COLUMN MIGRATIONS
  // =========================

  // Add cost_price to existing products table.
  await pool.query(`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2) DEFAULT 0
  `);

  // Add brand_id to existing products table.
  // Existing products will have NULL brand_id.
  await pool.query(`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS brand_id INTEGER
  `);

  // Add foreign key relationship between products and brands.
  // If a brand is deleted, the product remains but brand_id becomes NULL.
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'products_brand_id_fkey'
          AND table_name = 'products'
      ) THEN
        ALTER TABLE products
        ADD CONSTRAINT products_brand_id_fkey
        FOREIGN KEY (brand_id)
        REFERENCES brands(id)
        ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  // =========================
  // INITIAL BRANDS
  // =========================
  // ON CONFLICT DO NOTHING prevents duplicates
  // and preserves existing brand information.

  await pool.query(`
    INSERT INTO brands (name, brand_code)
    VALUES
      ('Nike', 'NI'),
      ('Adidas', 'AD'),
      ('Puma', 'PU'),
      ('Reebok', 'RB'),
      ('Carter''s', 'CA'),
      ('H&M', 'HM'),
      ('Zara', 'ZA'),
      ('Primark', 'PR'),
      ('NEXT', 'NX'),
      ('Joe Fresh', 'JF'),
      ('Jump', 'JP'),
      ('Lacoste', 'LC'),
      ('US Polo Assn.', 'US'),
      ('Lee', 'LE'),
      ('Columbia', 'CO'),
      ('ET', 'ET'),
      ('3 Pommes', '3P')
    ON CONFLICT DO NOTHING
  `);

  // =========================
  // ORDERS
  // =========================
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

  console.log("Database tables initialized successfully");
};

export default initDatabase;
