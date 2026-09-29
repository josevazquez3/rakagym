import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { LoginForm } from "@/components/auth/login-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <main id="contenido" className="brand-cracks flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-6 shadow-gold sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark size={112} priority className="h-28 w-28" />
          <h1 className="mt-4 font-display text-4xl uppercase tracking-wide">RAKA GYM</h1>
          <p className="mt-1 font-condensed text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            {siteConfig.slogan}
          </p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-gold hover:text-gold-light">
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
