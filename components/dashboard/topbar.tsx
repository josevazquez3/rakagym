"use client";

import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { roleLabel } from "@/lib/labels";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function Topbar({
  nombre,
  apellido,
  email,
  role,
}: {
  nombre: string;
  apellido: string;
  email: string;
  role: "ADMIN" | "USUARIO";
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
            <Menu className="h-5 w-5 text-gold" />
          </Button>
        </DialogTrigger>
        <DialogContent className="left-0 top-0 h-full max-h-none w-72 max-w-none translate-x-0 translate-y-0 rounded-none p-0">
          <DialogTitle className="sr-only">Menú</DialogTitle>
          <Sidebar role={role} onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
      <div className="min-w-0 flex-1 md:ml-0">
        <p className="truncate font-condensed text-sm font-semibold uppercase tracking-wide">
          {nombre} {apellido}
        </p>
        <p className="truncate text-xs text-muted">
          {roleLabel[role]} · {email}
        </p>
      </div>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" size="sm">
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Cerrar sesión</span>
          <span className="sr-only sm:hidden">Cerrar sesión</span>
        </Button>
      </form>
    </header>
  );
}
