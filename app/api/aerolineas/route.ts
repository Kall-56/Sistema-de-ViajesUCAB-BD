import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/require-admin";

function requireProveedorOrAdmin() {
  const session = getSessionUser();
  if (!session)
    return { ok: false as const, status: 401, error: "No autenticado" };

  const isAdmin = session.rolId === 3;
  const isProveedor = session.rolId === 2 && !!session.proveedorId;

  if (!isAdmin && !isProveedor) {
    return { ok: false as const, status: 403, error: "Solo proveedor o admin" };
  }

  return { ok: true as const, session, isAdmin };
}

// GET: listar aerolíneas (servicios aéreos)
// - Admin ve todos
// - Proveedor ve solo los suyos (fk_proveedor = session.proveedorId)
export async function GET() {
  const auth = requireProveedorOrAdmin();
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { session, isAdmin } = auth;

  const params: any[] = [];
  let where = `s.tipo_servicio = 'aereo'`;

  if (!isAdmin) {
    params.push(session.proveedorId);
    where += ` AND s.fk_proveedor = $${params.length}`;
  }

  // 2A/2B: query directo SOLO para listar (porque no tienes función de listado)
  // Incluye proveedor (para badge), lugar, viaje, transporte, cupo, terminal y links de imágenes.
  const sql = `
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
      s.fk_proveedor,
      p.nombre_proveedor,
      v.id AS viaje_id,
      v.costo_compensacion,
      t.id AS transporte_id,
      t.tipo_avion,
      c.numero_cupo,
      toper.nombre AS terminal_nombre,
      toper.fk_lugar AS terminal_lugar_id,
      COALESCE(array_agg(i.link) FILTER (WHERE i.link IS NOT NULL), '{}') AS links_imagenes
    FROM servicio s
    JOIN proveedor p ON p.id = s.fk_proveedor
    JOIN lugar l ON l.id = s.fk_lugar
    JOIN viaje v ON v.id = s.fk_viaje
    JOIN transporte t ON t.fk_viaje = v.id
    JOIN cupo c ON c.fk_transporte = t.id
    JOIN terminal_operacion toper ON toper.fk_viaje = v.id
    LEFT JOIN imagen i ON i.fk_servicio = s.id
    WHERE ${where}
    GROUP BY
      s.id, l.nombre, p.nombre_proveedor,
      v.id, v.costo_compensacion,
      t.id, t.tipo_avion,
      c.numero_cupo,
      toper.nombre, toper.fk_lugar
    ORDER BY s.id DESC;
  `;

  const { rows } = await pool.query(sql, params);
  return NextResponse.json({
    proveedorNombre: isAdmin ? null : rows?.[0]?.nombre_proveedor ?? null,
    aerolineas: rows,
  });
}

// POST: crear aerolínea (servicio aéreo) usando tu FUNCIÓN insertar_servicio_viaje_aereolinea(...)
export async function POST(req: Request) {
  const auth = requireProveedorOrAdmin();
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { session, isAdmin } = auth;

  const body = await req.json();
  const {
    nombre,
    descripcion,
    costo_servicio,
    costo_compensacion,
    denominacion,
    millas_otorgadas,
    id_lugar,
    id_proveedor, // admin puede mandarlo; proveedor NO
    tipo_avion,
    cupo,
    nombre_terminal,
    lugar_terminal,
    links_imagenes,
  } = body;

  // proveedor solo puede crear para sí mismo
  const proveedorIdFinal = isAdmin
    ? Number(id_proveedor)
    : Number(session.proveedorId);

  if (
    !nombre ||
    !descripcion ||
    costo_servicio == null ||
    costo_compensacion == null ||
    !denominacion ||
    millas_otorgadas == null ||
    !id_lugar ||
    !proveedorIdFinal ||
    !tipo_avion ||
    cupo == null ||
    !nombre_terminal ||
    !lugar_terminal
  ) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  const arrLinks: string[] = Array.isArray(links_imagenes)
    ? links_imagenes
    : [];

  const { rows } = await pool.query(
    `SELECT insertar_servicio_viaje_aereolinea($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) AS id`,
    [
      nombre,
      descripcion,
      Number(costo_servicio),
      Number(costo_compensacion),
      denominacion,
      Number(millas_otorgadas),
      Number(id_lugar),
      proveedorIdFinal,
      tipo_avion,
      Number(cupo),
      nombre_terminal,
      Number(lugar_terminal),
      arrLinks,
    ]
  );

  return NextResponse.json({ ok: true, id: rows[0]?.id }, { status: 201 });
}
