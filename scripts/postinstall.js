/**
 * postinstall script: Apply patches to node_modules
 *
 * This script fixes known bugs in dependencies that don't have patched
 * versions available for our current Expo SDK version.
 *
 * Patches applied:
 * - expo-audio 0.3.5: Fix inverted `isPrepared` guard in AudioModule.kt
 *   (https://github.com/expo/expo/issues/35589)
 *   The condition `if (!ref.isPrepared)` prevents `record()` from being
 *   called when the recorder IS prepared. Fixed upstream in 0.4.0+ (SDK 53+)
 *   but not backported to 0.3.x (SDK 52).
 */

const fs = require("fs");
const path = require("path");

/** @type {Array<{file: string, search: string, replace: string, description: string}>} */
const patches = [
  {
    file: path.join(
      __dirname,
      "..",
      "node_modules",
      "expo-audio",
      "android",
      "src",
      "main",
      "java",
      "expo",
      "modules",
      "audio",
      "AudioModule.kt"
    ),
    search: "if (!ref.isPrepared) {",
    replace: "if (ref.isPrepared) {",
    description: "expo-audio#35589: Fix inverted isPrepared guard in record()",
  },
];

let applied = 0;
let skipped = 0;

for (const patch of patches) {
  if (!fs.existsSync(patch.file)) {
    console.warn(`[postinstall] SKIP: File not found: ${patch.file}`);
    skipped++;
    continue;
  }

  const content = fs.readFileSync(patch.file, "utf8");

  if (content.includes(patch.replace)) {
    // Already patched
    skipped++;
    continue;
  }

  if (!content.includes(patch.search)) {
    console.warn(
      `[postinstall] SKIP: Search string not found in ${path.basename(patch.file)} — ` +
        `perhaps the dependency version has changed? Patch: ${patch.description}`
    );
    skipped++;
    continue;
  }

  const patched = content.replace(patch.search, patch.replace);
  fs.writeFileSync(patch.file, patched, "utf8");
  console.log(`[postinstall] APPLIED: ${patch.description}`);
  applied++;
}

console.log(
  `[postinstall] Done. ${applied} patch(es) applied, ${skipped} skipped.`
);
