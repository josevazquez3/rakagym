import { del, put } from "@vercel/blob";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

export class BlobUploadError extends Error {
  readonly code: "NOT_CONFIGURED" | "INVALID_TYPE" | "INVALID_SIZE";

  constructor(code: "NOT_CONFIGURED" | "INVALID_TYPE" | "INVALID_SIZE", message: string) {
    super(message);
    this.name = "BlobUploadError";
    this.code = code;
  }
}

function token() {
  const value = process.env.BLOB_READ_WRITE_TOKEN;
  if (!value) {
    throw new BlobUploadError(
      "NOT_CONFIGURED",
      "Falta BLOB_READ_WRITE_TOKEN para guardar imágenes.",
    );
  }
  return value;
}

export async function uploadCarouselImage(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_TYPES.has(file.type) || !ALLOWED_EXT.has(extension)) {
    throw new BlobUploadError("INVALID_TYPE", "Usá una imagen JPG, PNG o WEBP.");
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new BlobUploadError("INVALID_SIZE", "La imagen debe pesar menos de 4 MB.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80) || "imagen";
  return put(`carousel/${crypto.randomUUID()}-${safeName}`, file, {
    access: "public",
    token: token(),
  });
}

export async function deleteCarouselBlob(url: string) {
  if (!url.startsWith("https://") || !url.includes(".blob.vercel-storage.com")) return;
  try {
    await del(url, { token: token() });
  } catch (error) {
    console.error(error);
  }
}
