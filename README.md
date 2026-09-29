# RAKA GYM

Aplicación web del gimnasio: portada pública y sistema interno con roles.

Slogan: **Fuerza - Rendimiento & Boxeo**.

## Stack

- Next.js 14 (App Router) y TypeScript
- Tailwind CSS y componentes al estilo shadcn/ui
- PostgreSQL en Neon con Prisma
- Vercel Blob para las fotos del carrusel
- Auth.js (NextAuth v5) con credenciales, bcrypt y sesión JWT
- Zod, React Hook Form y Framer Motion

## Roles

- **ADMIN**: padrón, rutinas, tesorería, consultas y carrusel.
- **USUARIO**: sus rutinas asignadas y su perfil.

El middleware, las server actions y las páginas protegidas validan el rol. `passwordHash` no se envía al cliente.

## Variables de entorno

Copiá `.env.example` a `.env` y completá:

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Connection string pooled de Neon |
| `DIRECT_URL` | Connection string directa de Neon (migraciones) |
| `AUTH_SECRET` | Secreto de la sesión. Generala con `openssl rand -base64 32` |
| `AUTH_URL` | URL pública de la app (`http://localhost:3000` en local) |
| `BLOB_READ_WRITE_TOKEN` | Token del store de Vercel Blob |
| `ADMIN_EMAIL` | Email del administrador inicial |
| `ADMIN_PASSWORD` | Contraseña inicial (8 a 72 caracteres) |

Contacto y redes del pie se editan en `lib/site.ts`.

## Base de datos local

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

El seed crea el administrador solo si ese email no existe. No pisa la contraseña en corridas posteriores.

## Deploy en Vercel

1. Creá un proyecto de Neon y copiá la URL pooled en `DATABASE_URL` y la directa en `DIRECT_URL`.
2. En Vercel, importá el repositorio y cargá todas las variables de `.env.example`. `AUTH_URL` tiene que ser la URL de producción.
3. Creá un Blob store en el proyecto de Vercel y pegá el token en `BLOB_READ_WRITE_TOKEN`.
4. El build ejecuta `prisma generate && next build`.
5. Después del primer deploy, aplicá el esquema y el administrador:

```bash
npx prisma migrate deploy
npm run db:seed
```

Esas dos corridas usan las variables del entorno donde las ejecutes (local apuntando a Neon, o el shell de Vercel).

## Módulos

- `/` portada, carrusel y formulario de consultas
- `/login` acceso
- `/panel` resumen
- `/rutinas` planes y asignaciones
- `/tesoreria` ingresos, egresos, cuotas y totales (admin)
- `/usuarios/padron` alta, edición, baja lógica, rol y clave (admin)
- `/consultas` bandeja de consultas (admin)
- `/carrusel` fotos en Vercel Blob (admin)
- `/perfil` datos y contraseña propios

El nombre que se ve en la barra sale de la sesión JWT. Si lo cambiás en el perfil, volvé a ingresar para verlo actualizado.

## Límites

El rate limit de login y de consultas vive en memoria del proceso. En varias instancias de Vercel no se comparte; alcanza para frenar abusos simples en un solo nodo.
