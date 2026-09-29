import Image from "next/image";
import { cn } from "@/lib/utils";

export function LogoMark({
  size = 56,
  priority = false,
  className,
}: {
  size?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src="/brand/logo.png"
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn("rounded-full object-cover", className)}
    />
  );
}
