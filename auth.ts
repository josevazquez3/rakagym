import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            rol: true,
            activo: true,
            passwordHash: true,
          },
        });

        if (!user?.activo) {
          await bcrypt.compare(parsed.data.password, await dummyHash());
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.nombre} ${user.apellido}`,
          role: user.rol,
          nombre: user.nombre,
          apellido: user.apellido,
        };
      },
    }),
  ],
});

let cachedDummyHash: string | null = null;

async function dummyHash() {
  if (!cachedDummyHash) {
    cachedDummyHash = await bcrypt.hash("raka-invalid-user", 12);
  }
  return cachedDummyHash;
}
