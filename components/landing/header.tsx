import Link from "next/link";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { LogoMark } from "@/components/brand/logo-mark";
import { Button } from "@/components/ui/button";

export async function Header() {
  let session: Session | null = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-3 rounded-md">
          <LogoMark size={56} priority className="h-14 w-14" />
          <span className="font-display text-xl uppercase tracking-wide sm:text-2xl">RAKA GYM</span>
        </Link>
        <Button asChild>
          <Link href={session?.user?.id ? "/panel" : "/login"}>{session?.user?.id ? "Panel" : "Ingresar"}</Link>
        </Button>
      </div>
    </header>
  );
}
