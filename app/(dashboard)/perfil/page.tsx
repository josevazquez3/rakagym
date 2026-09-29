import { requirePageRole } from "@/lib/auth/permissions";
import { prisma, withDb } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { DbAlert } from "@/components/dashboard/db-alert";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata = { title: "Mi perfil" };

export default async function ProfilePage() {
  const session = await requirePageRole(["ADMIN", "USUARIO"]);
  const result = await withDb(() =>
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { nombre: true, apellido: true, email: true, celular: true },
    }),
  );

  if (!result.ok || !result.data) return <DbAlert />;

  return (
    <div>
      <PageHeader title="Mi perfil" description="Actualizá tus datos y tu contraseña." />
      <ProfileForm
        profile={{
          nombre: result.data.nombre,
          apellido: result.data.apellido,
          email: result.data.email,
          celular: result.data.celular ?? "",
        }}
      />
    </div>
  );
}
