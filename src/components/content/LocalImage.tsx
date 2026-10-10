import Image from "next/image";
import type { LocalMedia } from "@/src/types/game";
export default function LocalImage({
  image,
  priority = false,
  className = "",
}: {
  image: LocalMedia;
  priority?: boolean;
  className?: string;
}) {
  if (!image.src || !image.width || !image.height) return null;
  return (
    <Image
      className={className}
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      preload={priority}
      unoptimized
      loading={priority ? undefined : "lazy"}
    />
  );
}
