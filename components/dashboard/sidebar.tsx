"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Dumbbell,
  Images,
  Inbox,
  LayoutDashboard,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: LucideIcon };

const adminItems: Item[] = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/rutinas", label: "Rutinas", icon: Dumbbell },
  { href: "/tesoreria", label: "Tesorería", icon: Wallet },
  { href: "/usuarios/padron", label: "Padrón", icon: Users },
  { href: "/consultas", label: "Consultas", icon: Inbox },
  { href: "/carrusel", label: "Carrusel", icon: Images },
];

const userItems: Item[] = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/rutinas", label: "Mis rutinas", icon: Dumbbell },
  { href: "/perfil", label: "Mi perfil", icon: UserRound },
];

function isActive(pathname: string, href: string) {
  if (href === "/panel") return pathname === "/panel";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  role,
  onNavigate,
}: {
  role: "ADMIN" | "USUARIO";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = role === "ADMIN" ? [...adminItems, { href: "/perfil", label: "Mi perfil", icon: UserRound }] : userItems;

  return (
    <div className="flex h-full flex-col bg-surface">
      <Link href="/panel" onClick={onNavigate} className="flex items-center gap-3 border-b border-border px-4 py-4">
        <LogoMark size={48} className="h-12 w-12" />
        <span className="font-display text-xl uppercase tracking-wide">RAKA GYM</span>
      </Link>
      <nav className="flex-1 space-y-1 py-3" aria-label="Secciones">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 border-l-2 px-4 py-3 font-condensed text-sm font-semibold uppercase tracking-wider",
                active
                  ? "border-gold bg-surface-2 text-white"
                  : "border-transparent text-muted hover:bg-surface-2 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 text-gold" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs text-muted">
        <Calendar className="h-4 w-4 text-gold" aria-hidden />
        Fuerza · Rendimiento · Boxeo
      </p>
    </div>
  );
}
