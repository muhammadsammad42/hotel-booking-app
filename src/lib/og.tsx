// Shared pieces for Open Graph images (next/og). Satori renders these
// outside the page, so CSS variables do not exist: the Sarai palette is
// written out as hex values here.
export const OG_SIZE = { width: 1200, height: 630 };

export const ogColors = {
  paper: "#FAF6EF",
  ink: "#1F1A17",
  muted: "#665A50",
  primary: "#B4532A",
  cream: "#F3ECE2",
  night: "#0F0C0A",
};

/**
 * A Google Font limited to the characters used, as a TTF that Satori can
 * read. Returns null if it cannot be fetched, so the image still renders.
 */
async function loadGoogleFont(family: string, text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`, {
        // An old user agent makes Google serve TTF instead of WOFF2.
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" },
      })
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * Fraunces for the headline and Instrument Sans for everything else, as the
 * site uses them. Pass the exact strings each one draws.
 */
export async function loadOgFonts(display: string, body: string) {
  const [serif, sans] = await Promise.all([
    loadGoogleFont("Fraunces:opsz,wght@144,500", display),
    loadGoogleFont("Instrument+Sans:wght@500", body),
  ]);
  return [
    ...(serif ? [{ name: "Fraunces", data: serif, weight: 500 as const, style: "normal" as const }] : []),
    ...(sans ? [{ name: "Instrument Sans", data: sans, weight: 500 as const, style: "normal" as const }] : []),
  ];
}

/** A filled rating star; font glyphs for stars are not reliable in Satori. */
export function OgStar({ size = 26, color = "#E0A84E" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill={color} d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
    </svg>
  );
}

/** The archway mark, with the same paths as src/components/brand/logo.tsx. */
export function OgMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill={ogColors.primary} />
      <g fill="none" stroke={ogColors.cream} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 25.5V15.2c0-4.6 3.2-7.3 7.5-10.2 4.3 2.9 7.5 5.6 7.5 10.2v10.3" />
        <path d="M6 25.5h20" />
      </g>
      <path d="M12.8 25.5v-7.6c0-2.3 1.4-3.8 3.2-5.3 1.8 1.5 3.2 3 3.2 5.3v7.6z" fill={ogColors.cream} />
    </svg>
  );
}

/** Resizes an Unsplash photo for the card; other hosts are used as they are. */
export function ogPhoto(url: string, width = 1200, height = 630) {
  if (!url.startsWith("https://images.unsplash.com/")) return url;
  const photo = new URL(url);
  photo.searchParams.set("w", String(width));
  photo.searchParams.set("h", String(height));
  photo.searchParams.set("fit", "crop");
  photo.searchParams.set("fm", "jpg");
  photo.searchParams.set("q", "80");
  return photo.toString();
}
