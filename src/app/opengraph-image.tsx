import { ImageResponse } from "next/og";

import { loadOgFonts, OG_SIZE, ogColors, OgMark, ogPhoto } from "@/lib/og";
import { site } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Sarai: stays worth the journey";

const PHOTO = "https://images.unsplash.com/photo-1573843981267-be1999ff37cd";

/** The default share card: the brand, the promise and a photo. */
export default async function SiteOgImage() {
  const headline = "Stays worth the journey.";
  const fonts = await loadOgFonts(`Sarai${headline}`, site.description);
  const display = "Fraunces";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: ogColors.paper, color: ogColors.ink, fontFamily: "Instrument Sans" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 620, padding: "64px 56px 64px 72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <OgMark size={56} />
            <span style={{ fontSize: 44, fontFamily: display }}>Sarai</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span style={{ fontSize: 68, lineHeight: 1.05, fontFamily: display }}>{headline}</span>
            <span style={{ fontSize: 26, lineHeight: 1.45, color: ogColors.muted }}>{site.description}</span>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>. */}
        <img src={ogPhoto(PHOTO, 580, 630)} alt="" width={580} height={630} style={{ objectFit: "cover", borderTopLeftRadius: 28, borderBottomLeftRadius: 28 }} />
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
