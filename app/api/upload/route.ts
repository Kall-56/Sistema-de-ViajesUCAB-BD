import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { cookies } from "next/headers";

// POST: Subir imagen
export async function POST(req: Request) {
  const c = cookies().get("viajesucab_session");
  if (!c?.value) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let session: any;
  try {
    session = JSON.parse(c.value);
  } catch {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  // Solo proveedores y admins pueden subir imágenes
  if (session?.rolId !== 2 && session?.rolId !== 3) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP)" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), "public", "uploads", "servicios");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generar nombre único
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomStr}.${extension}`;
    const filePath = join(uploadDir, fileName);

    // Convertir File a Buffer y guardar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retornar URL pública
    const publicUrl = `/uploads/servicios/${fileName}`;

    return NextResponse.json({ url: publicUrl, fileName }, { status: 201 });
  } catch (e: any) {
    console.error("Error subiendo archivo:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error subiendo archivo" },
      { status: 500 }
    );
  }
}

