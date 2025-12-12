import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DashboardContent } from "@/components/dashboard-content";

export default function PerfilPage() {
  const c = cookies().get("viajesucab_session")?.value;
  if (!c) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <DashboardContent />
      </main>
      <Footer />
    </div>
  );
}
