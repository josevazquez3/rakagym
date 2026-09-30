import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let session: Session | null = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-border md:block">
        <Sidebar role={session.user.role} />
      </aside>
      <div className="md:pl-64">
        <Topbar
          nombre={session.user.nombre}
          apellido={session.user.apellido}
          email={session.user.email ?? ""}
          role={session.user.role}
        />
        <main id="contenido" className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
