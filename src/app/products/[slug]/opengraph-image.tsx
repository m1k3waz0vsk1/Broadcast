import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const runtime = "nodejs";
export const alt = "BroadcastGFX package preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  const title = product?.title ?? "BroadcastGFX";
  const category = product?.category.name ?? "Broadcast Graphics";
  const price = product ? formatPrice(product.priceCents, product.currency) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
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
            gap: 12,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundImage: "linear-gradient(135deg, #7C5CFF, #22D3EE)",
            }}
          />
          BroadcastGFX
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#22D3EE",
              marginBottom: 16,
            }}
          >
            {category}
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, maxWidth: 1000, lineHeight: 1.15 }}>
            {title}
          </div>
          {price && (
            <div style={{ display: "flex", fontSize: 36, marginTop: 24, color: "#D8D5F5" }}>
              {price}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
