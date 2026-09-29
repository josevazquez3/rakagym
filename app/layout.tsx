import type { Metadata, Viewport } from "next";
import { Anton, Barlow_Condensed, Inter, Permanent_Marker } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const barlow = Barlow_Condensed({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const marker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marker",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RAKA GYM",
    template: "%s · RAKA GYM",
  },
  description: "Fuerza - Rendimiento & Boxeo",
  icons: { icon: "/brand/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${anton.variable} ${barlow.variable} ${inter.variable} ${marker.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-black"
        >
          Saltar al contenido
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
