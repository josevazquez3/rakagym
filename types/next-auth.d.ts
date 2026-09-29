import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      nombre: string;
      apellido: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    nombre: string;
    apellido: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    nombre: string;
    apellido: string;
  }
}

export {};
