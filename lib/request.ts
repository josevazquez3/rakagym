import { headers } from "next/headers";

export function getClientIp() {
  const headerList = headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return headerList.get("x-real-ip")?.slice(0, 64) ?? "local";
}
