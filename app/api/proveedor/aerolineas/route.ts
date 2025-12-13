import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requirePermission } from "@/lib/require-admin";

// Proveedor: solo sus "aerolíneas" (servicios tipo 'aereo')

export async function GET() {
  const auth = requirePermission(1); // lectura
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { session } = auth;

  if (session.rolId !== 2 || !session.proveedorId) {
    return NextResponse.json({ error: "Solo proveedores" }, { status: 403 });
  }

  const { rows } = await pool.query(
    `
    SELECT
      s.id,
      s.nombre,
      s.descripcion,
      s.costo_servicio,
      s.denominacion,
      s.millas_otorgadas,
      s.clasificacion,
      s.fk_lugar,
      l.nombre AS lugar_nombre,
      s.fk_proveedor
    FROM servicio s
    LEFT JOIN lugar l ON l.id = s.fk_lugar
    WHERE s.tipo_servicio = 'aereo'
      AND s.fk_proveedor = $1
    ORDER BY s.id DESC
    `,
    [session.proveedorId]
  );

  return NextResponse.json({ aerolineas: rows });
}

export async function POST(req: Request) {
  const auth = requirePermission(2); // escritura
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { session } = auth;

  if (session.rolId !== 2 || !session.proveedorId) {
    return NextResponse.json({ error: "Solo proveedores" }, { status: 403 });
  }

  const body = await req.json();

  const {
    nombre,
    descripcion,
    costoServicio,
    costoCompensacion,
    denominacion,
    millasOtorgadas,
    idLugar,
    tipoAvion,
    cupo,
    nombreTerminal,
    lugarTerminal,
    linksImagenes,
  } = body as {
    nombre: string;
    descripcion: string;
    costoServicio: number;
    costoCompensacion: number;
    denominacion: string;
    millasOtorgadas: number;
    idLugar: number;
    tipoAvion: string;
    cupo: number;
    nombreTerminal: string;
    lugarTerminal: number;
    linksImagenes: string[];
  };

  const costoServicioN = Number(costoServicio);
  const costoCompN = Number(costoCompensacion);
  const millasN = Number(millasOtorgadas);
  const idLugarN = Number(idLugar);
  const cupoN = Number(cupo);
  const lugarTerminalN = Number(lugarTerminal);
  const arrLinks: string[] = Array.isArray(linksImagenes) ? linksImagenes : [];

  if (
    !nombre ||
    !descripcion ||
    !Number.isFinite(costoServicioN) ||
    !Number.isFinite(costoCompN) ||
    !denominacion ||
    !Number.isFinite(millasN) ||
    !Number.isInteger(idLugarN) ||
    !tipoAvion ||
    !Number.isInteger(cupoN) ||
    !nombreTerminal ||
    !Number.isInteger(lugarTerminalN)
  ) {
    return NextResponse.json(
      { error: "Campos requeridos incompletos" },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT insertar_servicio_viaje_aereolinea(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::varchar[]
      ) AS id`,
      [
        nombre,
        descripcion,
        costoServicioN,
        costoCompN,
        denominacion,
        millasN,
        idLugarN,
        session.proveedorId, // amarrado al proveedor logueado
        tipoAvion,
        cupoN,
        nombreTerminal,
        lugarTerminalN,
        arrLinks,
      ]
    );

    await client.query("COMMIT");
    return NextResponse.json({ ok: true, id: rows[0]?.id }, { status: 201 });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { error: e?.message ?? "Error creando aerolínea" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
