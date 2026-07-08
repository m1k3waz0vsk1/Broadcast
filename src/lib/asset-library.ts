// Maps a package "format" label to the demo file(s) generated for it.
// Used when seeding products and when an admin creates a product, so every
// package ends up with downloadable (placeholder) files matching its formats.

export const assetLibrary: Record<string, string[]> = {
  PNG: ["overlay-1080p.png", "overlay-4k.png"],
  PSD: ["source-file.psd"],
  "After Effects Template": ["ae-template.aep"],
  "PNG Sequence": ["png-sequence.zip"],
  "MOV with Alpha": ["render-alpha.mov"],
  MP4: ["render.mp4"],
  "OBS Overlay": ["obs-scene-collection.json"],
  "OBS/vMix Overlay": ["obs-vmix-package.zip"],
  "Stream Deck Icons": ["streamdeck-icons.zip"],
  "Keynote & PowerPoint": ["deck.key", "deck.pptx"],
  Keynote: ["deck.key"],
};

export function assetFilesForFormat(format: string): string[] {
  return assetLibrary[format] ?? [`${format.toLowerCase().replace(/\s+/g, "-")}.zip`];
}
