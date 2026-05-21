/**
 * Fallback static index.html for Docker/nginx when not using Nitro.
 * Run after: npm run build
 */
import fs from "fs";
import path from "path";

const clientDir = path.resolve("dist/client");
const assetsDir = path.join(clientDir, "assets");

if (!fs.existsSync(assetsDir)) {
  console.error("[postbuild-static] dist/client/assets not found — run npm run build first");
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const jsEntry = files.find((f) => /^index-.*\.js$/.test(f));
const cssFile = files.find((f) => /^styles-.*\.css$/.test(f));

if (!jsEntry) {
  console.error("[postbuild-static] No index-*.js entry in dist/client/assets");
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>zkPass Portal</title>
  ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ""}
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/${jsEntry}"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(clientDir, "index.html"), html);
console.log("[postbuild-static] Wrote dist/client/index.html");
