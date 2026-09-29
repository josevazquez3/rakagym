import { z } from "zod";

export const carouselAltSchema = z.object({
  alt: z.string().trim().min(1, "El texto alternativo es obligatorio").max(140),
});
