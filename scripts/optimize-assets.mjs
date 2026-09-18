import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "assets", "optimized");
const version = "v1";

const images = [
  { source: "assets/elite-glass-hero.png", name: "elite-glass-hero", widths: [640, 960, 1440] },
  { source: "assets/shower-enclosure.png", name: "shower-enclosure", widths: [480, 640, 960, 1440] },
  { source: "assets/window-replacement.png", name: "window-replacement", widths: [480, 960] },
  { source: "assets/custom-glass-mirror.png", name: "custom-glass-mirror", widths: [480, 960] },
  { source: "assets/glass-railing-storefront.png", name: "glass-railing-storefront", widths: [480, 960] },
  { source: "assets/projects/project_1.jpg", name: "project-1", widths: [480, 960] },
  { source: "assets/projects/frontdoor_main.jpg", name: "frontdoor-main", widths: [480, 960] },
  { source: "assets/projects/stair_medina_main.jpg", name: "stair-medina-main", widths: [480, 960] },
  { source: "assets/projects/window_redmond_main.jpg", name: "window-redmond-main", widths: [480, 640, 960, 1440] },
  { source: "assets/projects/mirror_kirkland_main.jpg", name: "mirror-kirkland-main", widths: [480, 960] },
  { source: "assets/projects/patiodoor_redmond_main.jpg", name: "patiodoor-redmond-main", widths: [480, 960] },
];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const image of images) {
  const input = path.join(root, image.source);
  const metadata = await sharp(input).metadata();
  const widths = [...new Set(image.widths.map((width) => Math.min(width, metadata.width)))];
  for (const width of widths) {
    const base = path.join(outputDirectory, `${image.name}-${version}-${width}`);
    const pipeline = sharp(input).rotate().resize({ width, fit: "inside", withoutEnlargement: true });
    await Promise.all([
      pipeline.clone().avif({ quality: 50, effort: 6 }).toFile(`${base}.avif`),
      pipeline.clone().webp({ quality: 78, effort: 6 }).toFile(`${base}.webp`),
    ]);
  }
}

console.log(`Generated responsive AVIF and WebP assets in ${path.relative(root, outputDirectory)}.`);
