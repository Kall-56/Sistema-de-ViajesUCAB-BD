import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// PATCH: suspender/reactivar (activo=0/1)
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const auth = requirePermission(3);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const userId = Number(ctx.params.id);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { activo } = body as { activo: number };

  // Validar 0/1
  if (activo !== 0 && activo !== 1) {
    return NextResponse.json(
      { error: "activo debe ser 0 o 1" },
      { status: 400 }
    );
  }

  try {
    // Llama tu función de BD (ajustada a integer 0/1)
    await pool.query(`SELECT cambiar_estado_usuario($1,$2)`, [userId, activo]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error actualizando estatus" },
      { status: 500 }
    );
  }
}
