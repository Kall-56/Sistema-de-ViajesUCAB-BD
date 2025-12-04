// lib/db.ts
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ Falta la variable DATABASE_URL en .env.local");
}

// Pool de conexiones reutilizable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false }, // solo si el servidor lo exige
});

export default pool;
