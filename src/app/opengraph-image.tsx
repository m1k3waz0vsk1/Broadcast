import { ImageResponse } from "next/og";

export const alt = "BroadcastGFX — Broadcast & Event Graphics Packages";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundImage: "linear-gradient(135deg, #1b1030 0%, #3a1f66 45%, #0a3d47 100%)",
          color: "white",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#22D3EE",
            textTransform: "uppercase",
          }}
        >
          Broadcast &amp; Event Graphics
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, marginTop: 24 }}>
          BroadcastGFX
        </div>
        <div style={{ display: "flex", fontSize: 34, marginTop: 20, color: "#D8D5F5", maxWidth: 900 }}>
          Broadcast-quality graphics for webinars, livestreams &amp; conferences
        </div>
      </div>
    ),
    { ...size }
  );
}
