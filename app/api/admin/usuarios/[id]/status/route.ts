import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// PATCH: suspender/reactivar (activo=true/false)
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const auth = requirePermission(3);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const userId = Number(ctx.params.id);
  const body = await req.json();
  const { activo } = body as { activo: boolean };

  if (typeof activo !== "boolean") {
    return NextResponse.json(
      { error: "activo debe ser boolean" },
      { status: 400 }
    );
  }

  await pool.query(`SELECT cambiar_estado_usuario($1,$2)`, [userId, activo]);

  return NextResponse.json({ ok: true }, { status: 200 });
}
