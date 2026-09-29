"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type HeroSlide = { id: string; url: string; alt: string };

type Slide =
  | { id: string; alt: string; kind: "photo"; url: string }
  | { id: string; alt: string; kind: "logo" }
  | { id: string; alt: string; kind: "word"; word: string; marker?: boolean };

const fallbackSlides: Slide[] = [
  { id: "fallback-logo", alt: "Logo de RAKA GYM", kind: "logo" },
  { id: "fallback-fuerza", alt: "Fuerza", kind: "word", word: "Fuerza" },
  { id: "fallback-rendimiento", alt: "Rendimiento", kind: "word", word: "Rendimiento" },
  { id: "fallback-boxeo", alt: "Boxeo", kind: "word", word: "Boxeo", marker: true },
];

const controlClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-md border border-gold/70 bg-black/70 text-gold backdrop-blur";

function toSlides(images: HeroSlide[]): Slide[] {
  if (images.length === 0) return fallbackSlides;
  return images.map((image) => ({
    id: image.id,
    alt: image.alt,
    kind: "photo",
    url: image.url,
  }));
}

export function HeroCarousel({ images }: { images: HeroSlide[] }) {
  const reduceMotion = useReducedMotion();
  const slides = toSlides(images);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (reduceMotion || paused || hovered || count < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [reduceMotion, paused, hovered, count]);

  function go(next: number) {
    if (count === 0) return;
    setIndex((next + count) % count);
  }

  const current = slides[index];

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Fotos del gimnasio"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(index + 1);
        if (event.key === "ArrowLeft") go(index - 1);
      }}
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-background"
    >
      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={current.id}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.45 }}
            drag={reduceMotion || count < 2 ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(index + 1);
              if (info.offset.x > 60) go(index - 1);
            }}
          >
            {current.kind === "photo" ? (
              <Image
                src={current.url}
                alt={current.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="hero-stage absolute inset-0">
                <div className="absolute inset-x-0 top-24 bottom-36 flex items-center justify-center px-6">
                  {current.kind === "logo" ? (
                    <Image
                      src="/brand/logo.png"
                      alt={current.alt}
                      width={420}
                      height={420}
                      priority
                      className="h-64 w-64 rounded-full object-cover shadow-gold sm:h-80 sm:w-80"
                    />
                  ) : (
                    <p
                      className={
                        current.marker
                          ? "text-center font-marker text-6xl text-gold-light sm:text-8xl"
                          : "bg-brand-gradient bg-clip-text text-center font-display text-6xl uppercase tracking-wide text-transparent sm:text-8xl"
                      }
                    >
                      {current.word}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/45" />

      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-5xl flex-col gap-5 px-4 pb-8 sm:px-6">
        <div className="pointer-events-none">
          <p className="font-condensed text-sm font-semibold uppercase tracking-[0.35em] text-gold">RAKA GYM</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl uppercase leading-[0.95] tracking-wide text-white sm:text-6xl md:text-7xl">
            Fuerza - Rendimiento &{" "}
            <span className="font-marker text-[0.72em] normal-case tracking-normal text-gold-light">Boxeo</span>
          </h1>
        </div>
        {count > 1 ? (
          <div className="flex items-center gap-3">
            <button type="button" className={controlClass} aria-label="Foto anterior" onClick={() => go(index - 1)}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" className={controlClass} aria-label="Foto siguiente" onClick={() => go(index + 1)}>
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={controlClass}
              aria-label={paused ? "Reanudar carrusel" : "Pausar carrusel"}
              aria-pressed={paused}
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2" role="tablist" aria-label="Fotos">
              {slides.map((image, imageIndex) => (
                <button
                  key={image.id}
                  type="button"
                  role="tab"
                  aria-selected={imageIndex === index}
                  aria-label={`Ir a la foto ${imageIndex + 1}: ${image.alt}`}
                  onClick={() => setIndex(imageIndex)}
                  className={
                    imageIndex === index ? "h-2.5 w-7 rounded-full bg-gold" : "h-2.5 w-2.5 rounded-full bg-gold/40"
                  }
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
