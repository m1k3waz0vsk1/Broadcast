// Generates a stylized SVG mockup cover image at request time, used as a
// fallback when an admin doesn't supply a real cover image URL.

const W = 800;
const H = 500;

const palettes = {
  violet: { from: "#1b1030", to: "#3a1f66", accent: "#7c5cff" },
  cyan: { from: "#03191c", to: "#0a3d47", accent: "#22d3ee" },
  live: { from: "#1a0810", to: "#4a0f24", accent: "#ff3b5c" },
  amber: { from: "#201406", to: "#4a2e08", accent: "#f5a623" },
  emerald: { from: "#04150f", to: "#0b3d2c", accent: "#34d399" },
  indigo: { from: "#0b1030", to: "#1c2566", accent: "#6366f1" },
} as const;

const styles = ["grid", "wave", "live", "rings", "dots"] as const;

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function seededPick<T>(items: readonly T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return items[hash % items.length];
}

export function generatePlaceholderSvg(title: string, kicker: string): string {
  const paletteKey = seededPick(Object.keys(palettes) as (keyof typeof palettes)[], title);
  const { from, to, accent } = palettes[paletteKey];
  const style = seededPick(styles, kicker + title);
  const id = title.replace(/[^a-z0-9]/gi, "").slice(0, 12) || "ph";

  const gridLines =
    style === "grid"
      ? Array.from({ length: 6 })
          .map((_, i) => `<line x1="${(i + 1) * (W / 7)}" y1="0" x2="${(i + 1) * (W / 7)}" y2="${H}" stroke="white" stroke-opacity="0.05" stroke-width="1"/>`)
          .join("")
      : "";

  const rings =
    style === "rings"
      ? `<circle cx="${W - 140}" cy="150" r="90" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="2"/>
         <circle cx="${W - 140}" cy="150" r="60" fill="none" stroke="${accent}" stroke-opacity="0.5" stroke-width="2"/>
         <circle cx="${W - 140}" cy="150" r="30" fill="none" stroke="${accent}" stroke-opacity="0.8" stroke-width="2"/>`
      : "";

  const wave =
    style === "wave"
      ? `<path d="M0,${H * 0.62} C ${W * 0.25},${H * 0.5} ${W * 0.35},${H * 0.72} ${W * 0.6},${H * 0.6} S ${W * 0.9},${H * 0.68} ${W},${H * 0.58} L ${W},${H} L 0,${H} Z" fill="${accent}" fill-opacity="0.12"/>`
      : "";

  const livePill =
    style === "live"
      ? `<rect x="${W - 128}" y="36" width="92" height="34" rx="17" fill="#ff3b5c"/>
         <circle cx="${W - 108}" cy="53" r="5" fill="white"/>
         <text x="${W - 96}" y="58" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="white">LIVE</text>`
      : "";

  const dots =
    style === "dots"
      ? Array.from({ length: 30 })
          .map((_, i) => {
            const x = (i * 137) % W;
            const y = (i * 89) % Math.round(H * 0.55);
            return `<circle cx="${x}" cy="${y}" r="1" fill="white" fill-opacity="0.25"/>`;
          })
          .join("")
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <linearGradient id="bar-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg-${id})"/>
  ${gridLines}
  ${dots}
  ${wave}
  ${rings}
  ${livePill}
  <rect x="40" y="40" width="46" height="46" rx="12" fill="white" fill-opacity="0.12"/>
  <rect x="54" y="54" width="18" height="18" rx="4" fill="${accent}"/>
  <text x="40" y="${H - 118}" font-family="Arial, sans-serif" font-size="14" letter-spacing="3" font-weight="700" fill="${accent}">${escapeXml(kicker.toUpperCase())}</text>
  <rect x="40" y="${H - 96}" width="${Math.min(620, 60 + title.length * 17)}" height="64" fill="url(#bar-${id})" fill-opacity="0.5"/>
  <text x="40" y="${H - 52}" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="white">${escapeXml(title)}</text>
  <rect x="40" y="${H - 40}" width="120" height="4" fill="${accent}"/>
</svg>`;
}

export function generatePlaceholderDataUri(title: string, kicker: string): string {
  const svg = generatePlaceholderSvg(title, kicker);
  const base64 = Buffer.from(svg, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}
