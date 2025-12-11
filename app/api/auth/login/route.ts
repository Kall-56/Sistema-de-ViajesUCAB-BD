// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateCredentials } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { loginEmail, loginPassword } = await req.json();

    if (!loginEmail || !loginPassword) {
      return NextResponse.json(
        { error: "Correo y contraseña son requeridos." },
        { status: 400 }
      );
    }

    const user = await validateCredentials(loginEmail, loginPassword);

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { message: "Login exitoso", user },
      { status: 200 }
    );

    // Guardamos el usuario en una cookie como JSON.
    response.cookies.set("viajesucab_session", JSON.stringify(user), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
