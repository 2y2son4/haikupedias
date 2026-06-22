import { existsSync, readFileSync } from "node:fs";

const candidateStatsFiles = [
  "dist/apps/haikupedias-shell/browser/stats.json",
  "dist/apps/haikupedias-shell/stats.json",
  "docs/browser/stats.json",
  "docs/stats.json",
  "dist/browser/stats.json",
  "dist/stats.json",
];

const statsPath = candidateStatsFiles.find((path) => existsSync(path));

if (!statsPath) {
  console.error(
    "No Angular stats.json file found. Run a production build with --stats-json first.",
  );
  process.exit(1);
}

const stats = JSON.parse(readFileSync(statsPath, "utf8"));
const entrypoints = stats?.entrypoints ?? {};

const entrypointNames = Object.keys(entrypoints);
if (entrypointNames.length === 0) {
  console.error(`No entrypoints found in ${statsPath}.`);
  process.exit(1);
}

const seen = new Set();
const measuredAssets = [];

for (const name of entrypointNames) {
  const assets = entrypoints[name]?.assets ?? [];
  for (const asset of assets) {
    if (seen.has(asset.name)) continue;
    seen.add(asset.name);
    if (
      (asset.name.endsWith(".js") || asset.name.endsWith(".css")) &&
      typeof asset.size === "number"
    ) {
      measuredAssets.push({ name: asset.name, size: asset.size });
    }
  }
}

if (measuredAssets.length === 0) {
  console.error(`No measurable initial JS/CSS assets found in ${statsPath}.`);
  process.exit(1);
}

measuredAssets.sort((a, b) => b.size - a.size);
const totalBytes = measuredAssets.reduce((sum, asset) => sum + asset.size, 0);
const largestAsset = measuredAssets[0];
const kb = (bytes) => (bytes / 1024).toFixed(2);

console.log(`Bundle stats source: ${statsPath}`);
console.log(`Initial JS/CSS total: ${kb(totalBytes)} KiB`);
console.log(
  `Largest initial asset: ${largestAsset.name} (${kb(largestAsset.size)} KiB)`,
);
console.log("Top 5 initial assets:");

for (const asset of measuredAssets.slice(0, 5)) {
  console.log(`- ${asset.name}: ${kb(asset.size)} KiB`);
}
