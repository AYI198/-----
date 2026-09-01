import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const outDir = join(root, "dist");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const file of ["index.html", "styles.css", "script.js", ".nojekyll"]) {
  await cp(join(root, file), join(outDir, file));
}

await cp(join(root, "assets"), join(outDir, "assets"), { recursive: true });

for (const skippedAsset of [
  "assets/amazon/amazon-collection.jpg",
  "assets/amazon/amazon-final.jpg",
  "assets/amazon/amazon-visual-design-02.png",
  "assets/activity-banner/activity-banner-06.png",
  "assets/user-gallery/gallery-20.png"
]) {
  await rm(join(outDir, skippedAsset), { force: true });
}

console.log("Static site built to dist/");
