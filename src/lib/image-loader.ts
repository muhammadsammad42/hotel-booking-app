"use client";

// Image loader for every next/image in the app (see next.config.ts).
//
// Hotel photos come from Unsplash, whose CDN resizes and re-encodes on
// request. Asking it for the exact width is faster than routing each photo
// through the Next.js optimizer, which would download a large original first.
// Images from any other host are served as they are.

type LoaderParams = { src: string; width: number; quality?: number };

const UNSPLASH_HOST = "images.unsplash.com";

export default function imageLoader({ src, width, quality }: LoaderParams) {
  if (!src.startsWith(`https://${UNSPLASH_HOST}/`)) return src;

  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  url.searchParams.set("w", String(width));
  // 65 is visually lossless for these photos in AVIF and WebP, and lighter.
  url.searchParams.set("q", String(quality ?? 65));
  return url.toString();
}
