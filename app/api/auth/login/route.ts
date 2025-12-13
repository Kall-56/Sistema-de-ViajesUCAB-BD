import { NextRequest, NextResponse } from "next/server";
import { validateCredentials } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { loginEmail, loginPassword } = await req.json();

    if (!loginEmail || !loginPassword) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    console.log("🟡 POST /api/auth/login:", loginEmail);

    const sessionUser = await validateCredentials(loginEmail, loginPassword);

    const res = NextResponse.json(
      { ok: true, user: sessionUser },
      { status: 200 }
    );

    res.cookies.set("viajesucab_session", JSON.stringify(sessionUser), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8, // 8h
      sameSite: "lax",
    });

    console.log("🟢 Cookie creada viajesucab_session");
    return res;
  } catch (err: any) {
    const msg = err?.message ?? "Login inválido";

    // Si el mensaje viene de SQL y dice suspendido => 403
    const lower = String(msg).toLowerCase();
    const status = lower.includes("suspend") ? 403 : 401;

    return NextResponse.json({ error: msg }, { status });
  }
}
