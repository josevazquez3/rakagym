import { loadEnvConfig } from "@next/env";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Definí ADMIN_EMAIL y ADMIN_PASSWORD antes de correr el seed.");
  }

  if (password.length < 8 || password.length > 72) {
    throw new Error("ADMIN_PASSWORD debe tener entre 8 y 72 caracteres.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      nombre: "Admin",
      apellido: "RAKA",
      email,
      passwordHash,
      rol: Role.ADMIN,
      activo: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
