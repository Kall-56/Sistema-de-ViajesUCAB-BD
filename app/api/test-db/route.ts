// app/api/test-db/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW()");
    return NextResponse.json({
      ok: true,
      now: result.rows[0].now,
    });
  } catch (error: any) {
    console.error("Error al conectar a la BD:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
