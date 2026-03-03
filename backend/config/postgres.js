import pkg from "pg";

const { Pool } = pkg;

let pool;

const connectPostgres = async () => {
  if (pool) {
    return pool;
  }

  const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}` +
      `@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`;

  pool = new Pool({
    connectionString,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
  });

  // Simple connectivity check
  await pool.query("SELECT 1");
  console.log("PostgreSQL connected");

  return pool;
};

const getPool = async () => {
  if (!pool) {
    await connectPostgres();
  }
  return pool;
};

export { connectPostgres, getPool };
export default connectPostgres;

