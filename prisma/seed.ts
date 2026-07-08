import { PrismaClient } from "@prisma/client";
import { assetFilesForFormat } from "../src/lib/asset-library";

const prisma = new PrismaClient();

const categories = [
  { slug: "webinar", name: "Webinar Essentials" },
  { slug: "livestream", name: "Livestream Overlays" },
  { slug: "conference", name: "Conference & Summit" },
  { slug: "lower-thirds", name: "Lower Thirds" },
  { slug: "countdown", name: "Countdown & Waiting Screens" },
];

const products = [
  {
    slug: "corporate-webinar-overlay-kit",
    title: "Corporate Webinar Overlay Kit",
    tagline: "Clean, on-brand overlays for host cams, slides, and Q&A screens.",
    category: "webinar",
    priceCents: 3900,
    featured: true,
    formats: ["PNG", "PSD", "OBS/vMix Overlay", "Keynote & PowerPoint"],
    description:
      "A complete overlay system for polished corporate webinars: host name badges, slide-frame borders, agenda cards, Q&A prompts, and a branded waiting screen. Built to drop straight into OBS, vMix, StreamYard, or Zoom as an overlay layer — swap the logo and colors and you're live.",
  },
  {
    slug: "minimal-line-lower-thirds",
    title: "Minimal Line Lower Thirds",
    tagline: "20 animated lower thirds with a clean single-line aesthetic.",
    category: "lower-thirds",
    priceCents: 2900,
    featured: true,
    formats: ["After Effects Template", "PNG Sequence", "MOV with Alpha"],
    description:
      "Twenty minimal, single-line lower thirds for speaker name/title cards. Includes an After Effects template with full color controls plus rendered MOV-with-alpha files for editors who don't use AE. Works beautifully for interviews, panels, and remote guest call-outs.",
  },
  {
    slug: "neon-pulse-livestream-overlay",
    title: "Neon Pulse Livestream Overlay",
    tagline: "High-energy overlay pack for gaming and creator livestreams.",
    category: "livestream",
    priceCents: 4900,
    featured: true,
    formats: ["PNG", "OBS Overlay", "Stream Deck Icons"],
    description:
      "A full neon-accented broadcast layer: webcam frame, alert boxes, starting/BRB/ending screens, animated LIVE badge, and a chat-box frame. Pre-configured OBS scene collection included so you can import and go live in minutes.",
  },
  {
    slug: "summit-conference-stage-package",
    title: "Summit Conference Stage Package",
    tagline: "Full stage graphics system for multi-day conferences.",
    category: "conference",
    priceCents: 7900,
    featured: true,
    formats: ["PNG", "PSD", "After Effects Template", "Keynote"],
    description:
      "Everything a conference AV team needs: stage backdrop templates, speaker lower thirds, session bumpers, sponsor rotation screens, countdown-to-start, and a livestream frame for the hybrid broadcast. Designed for large screens and stream output alike.",
  },
  {
    slug: "aurora-countdown-timer-pack",
    title: "Aurora Countdown Timer Pack",
    tagline: "10 animated countdown screens for pre-show waiting rooms.",
    category: "countdown",
    priceCents: 1900,
    featured: false,
    formats: ["After Effects Template", "MP4", "MOV with Alpha"],
    description:
      "Ten looping countdown timer animations with soft gradient motion backgrounds — perfect for the 10 minutes before a webinar or livestream goes live. Editable end time, headline, and subtext in the included After Effects template.",
  },
  {
    slug: "podcast-studio-graphics-kit",
    title: "Podcast Studio Graphics Kit",
    tagline: "Video-podcast graphics: name cards, topic banners, clip frames.",
    category: "webinar",
    priceCents: 3400,
    featured: false,
    formats: ["PNG", "PSD", "OBS Overlay"],
    description:
      "Built for video podcasts and talk-show style streams: host/guest name cards, topic banners, a social clip-ready 9:16 frame, and an end-card with subscribe prompts. Matches across YouTube, Twitch, and short-form clip exports.",
  },
  {
    slug: "esports-broadcast-overlay-bundle",
    title: "Esports Broadcast Overlay Bundle",
    tagline: "Tournament-grade overlays: scoreboards, brackets, casters.",
    category: "livestream",
    priceCents: 5900,
    featured: false,
    formats: ["PNG", "After Effects Template", "OBS Overlay"],
    description:
      "A tournament broadcast package with scoreboard bars, caster desk frames, bracket overlays, and sponsor ticker. Layered PSD and AE sources included so your production team can wire up live score data.",
  },
  {
    slug: "global-summit-lower-thirds",
    title: "Global Summit Lower Thirds",
    tagline: "Multi-language friendly lower thirds for international events.",
    category: "conference",
    priceCents: 2400,
    featured: false,
    formats: ["After Effects Template", "PNG Sequence"],
    description:
      "Lower thirds designed with generous text width for longer names, titles, and non-Latin scripts — built for international conferences and multi-language panels. Includes flag/region tag variant.",
  },
  {
    slug: "clean-corporate-titles-pack",
    title: "Clean Corporate Titles Pack",
    tagline: "Section titles, agenda slides, and transition cards.",
    category: "lower-thirds",
    priceCents: 2200,
    featured: false,
    formats: ["PNG", "PSD", "Keynote & PowerPoint"],
    description:
      "A tidy set of section title cards, agenda slides, and transition bumpers for internal town halls and corporate broadcasts. Editable in Keynote, PowerPoint, or Photoshop — no motion software required.",
  },
  {
    slug: "gradient-wave-waiting-room",
    title: "Gradient Wave Waiting Room",
    tagline: "Looping 'we'll be right back' and waiting-room screens.",
    category: "countdown",
    priceCents: 1500,
    featured: false,
    formats: ["MP4", "MOV with Alpha", "PNG"],
    description:
      "Soft looping gradient-wave backgrounds for waiting rooms, technical-difficulty screens, and intermission breaks. Drop straight into your streaming software as a scene or video source.",
  },
  {
    slug: "panel-discussion-graphics-kit",
    title: "Panel Discussion Graphics Kit",
    tagline: "Multi-speaker name bars and moderator prompts.",
    category: "conference",
    priceCents: 2900,
    featured: false,
    formats: ["PNG", "After Effects Template"],
    description:
      "Purpose-built for panel formats: stacked speaker name bars for up to 5 panelists, a moderator question prompt overlay, and a topic banner. Handles fast speaker swaps without cluttering the frame.",
  },
  {
    slug: "product-launch-livestream-kit",
    title: "Product Launch Livestream Kit",
    tagline: "Big-reveal graphics for product and feature launch streams.",
    category: "livestream",
    priceCents: 4400,
    featured: false,
    formats: ["PNG", "PSD", "After Effects Template"],
    description:
      "Launch-day graphics with a countdown-to-reveal screen, feature callout cards, spec comparison frames, and a social share end-card. Designed to build anticipation and land the big reveal moment.",
  },
];

async function main() {
  console.log("Seeding categories…");
  const categoryMap: Record<string, string> = {};
  for (const c of categories) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
    categoryMap[c.slug] = created.id;
  }

  console.log("Seeding products…");
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        priceCents: p.priceCents,
        featured: p.featured,
        coverImage: `/products/${p.slug}.svg`,
        previewImages: JSON.stringify([`/products/${p.slug}.svg`]),
        formats: JSON.stringify(p.formats),
        categoryId: categoryMap[p.category],
      },
      create: {
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        priceCents: p.priceCents,
        featured: p.featured,
        coverImage: `/products/${p.slug}.svg`,
        previewImages: JSON.stringify([`/products/${p.slug}.svg`]),
        formats: JSON.stringify(p.formats),
        categoryId: categoryMap[p.category],
      },
    });

    const existingAssets = await prisma.productAsset.findMany({ where: { productId: product.id } });
    if (existingAssets.length === 0) {
      for (const format of p.formats) {
        const files = assetFilesForFormat(format);
        for (const fileName of files) {
          await prisma.productAsset.create({
            data: {
              productId: product.id,
              fileName: `${p.slug}-${fileName}`,
              filePath: `downloads/${p.slug}/${fileName}`,
              sizeBytes: 1024 * 1024 * (5 + Math.floor(Math.random() * 40)),
            },
          });
        }
      }
    }
  }

  console.log("Seeding membership plan…");
  await prisma.plan.upsert({
    where: { slug: "all-access-monthly" },
    update: {
      name: "All-Access Membership",
      description: "Unlimited downloads of every broadcast and event graphics package, updated monthly.",
      priceCents: 2900,
      interval: "month",
    },
    create: {
      slug: "all-access-monthly",
      name: "All-Access Membership",
      description: "Unlimited downloads of every broadcast and event graphics package, updated monthly.",
      priceCents: 2900,
      interval: "month",
    },
  });

  await prisma.plan.upsert({
    where: { slug: "all-access-yearly" },
    update: {
      name: "All-Access Membership (Yearly)",
      description: "Unlimited downloads of every broadcast and event graphics package — save 40% with annual billing.",
      priceCents: 20900,
      interval: "year",
    },
    create: {
      slug: "all-access-yearly",
      name: "All-Access Membership (Yearly)",
      description: "Unlimited downloads of every broadcast and event graphics package — save 40% with annual billing.",
      priceCents: 20900,
      interval: "year",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
