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

console.log("Static site built to dist/");
