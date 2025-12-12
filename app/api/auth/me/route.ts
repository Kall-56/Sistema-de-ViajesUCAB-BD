import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const c = cookies().get("viajesucab_session");
  if (!c?.value) return NextResponse.json({ user: null }, { status: 200 });

  try {
    const user = JSON.parse(c.value);
    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
