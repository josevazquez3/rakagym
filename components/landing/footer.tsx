import { Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1Z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl uppercase tracking-wide">{siteConfig.name}</p>
          <p className="mt-2 font-condensed text-sm font-semibold uppercase tracking-[0.18em] text-gold">
            {siteConfig.slogan}
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-condensed text-sm font-semibold uppercase tracking-wide text-gold">Contacto</p>
          <a className="flex items-center gap-2 hover:text-gold" href={siteConfig.phoneHref}>
            <Phone className="h-4 w-4 text-gold" aria-hidden />
            {siteConfig.phoneDisplay}
          </a>
          <a className="flex items-center gap-2 hover:text-gold" href={`mailto:${siteConfig.email}`}>
            <Mail className="h-4 w-4 text-gold" aria-hidden />
            {siteConfig.email}
          </a>
          <p className="flex items-center gap-2 text-muted">
            <MapPin className="h-4 w-4 text-gold" aria-hidden />
            {siteConfig.address}
          </p>
        </div>
        <div className="space-y-3">
          <p className="font-condensed text-sm font-semibold uppercase tracking-wide text-gold">Redes</p>
          <div className="flex gap-3">
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-gold text-gold"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href={siteConfig.facebook}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-gold text-gold"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>
      <p className="border-t border-border px-4 py-4 text-center text-xs text-muted">
        © {year} {siteConfig.name}
      </p>
    </footer>
  );
}
