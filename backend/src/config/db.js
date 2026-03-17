import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// 🔍 Debug (remove later)
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("TYPE:", typeof process.env.DB_PASSWORD);

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: String(process.env.DB_PASSWORD || ""), // 🔥 CRITICAL FIX
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,        // 🔥 FIX
});

export default pool;