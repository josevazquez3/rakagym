export const ADMIN_ROUTES = ["/tesoreria", "/usuarios", "/consultas", "/carrusel"] as const;

export const PROTECTED_ROUTES = ["/panel", "/perfil", "/rutinas", ...ADMIN_ROUTES] as const;

export function matchesRoute(pathname: string, routes: readonly string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
