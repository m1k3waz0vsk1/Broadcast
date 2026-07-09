export const siteUrl = (
  process.env.APP_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

export const siteName = "BroadcastGFX";

export const siteTagline = "Broadcast & Event Graphics Packages";

export const siteDescription =
  "Broadcast-quality graphic packages for webinars, livestreams, and conferences — lower thirds, overlays, countdowns, and full show packages, ready in minutes.";
