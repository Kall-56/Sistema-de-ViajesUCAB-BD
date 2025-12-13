import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";

export async function GET() {
  const c = cookies().get("viajesucab_session");
  if (!c?.value) return NextResponse.json({ user: null }, { status: 200 });

  let user: any;
  try {
    user = JSON.parse(c.value);
  } catch {
    const res = NextResponse.json({ user: null }, { status: 200 });
    res.cookies.set("viajesucab_session", "", { path: "/", maxAge: 0 });
    return res;
  }

  const userId = Number(user?.userId);
  if (Number.isNaN(userId)) {
    const res = NextResponse.json({ user: null }, { status: 200 });
    res.cookies.set("viajesucab_session", "", { path: "/", maxAge: 0 });
    return res;
  }

  try {
    const { rows } = await pool.query(
      `SELECT activo FROM usuario WHERE id = $1`,
      [userId]
    );

    // si no existe o está suspendido => invalidar sesión
    if (!rows[0] || rows[0].activo !== 1) {
      const res = NextResponse.json({ user: null }, { status: 200 });
      res.cookies.set("viajesucab_session", "", { path: "/", maxAge: 0 });
      return res;
    }

    // sigue activo => devolver sesión
    return NextResponse.json({ user }, { status: 200 });
  } catch {
    // si falla BD, mejor no tumbar sesión; pero puedes decidir devolver null
    return NextResponse.json({ user }, { status: 200 });
  }
}
