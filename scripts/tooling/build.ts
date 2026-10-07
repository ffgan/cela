import { mkdir, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const banner = "/* Generated from scripts/. Edit the TypeScript source and run npm run build:js. */";

await build({
  entryPoints: [
    "scripts/site-ui.ts",
    "scripts/search-ui.ts",
    "scripts/search.ts",
    "scripts/list-paginate.ts",
    "scripts/home-effects.ts",
    "scripts/robot-tools.ts",
    "scripts/math.ts",
  ],
  bundle: true,
  format: "iife",
  target: "es2020",
  outdir: "static/js",
  legalComments: "none",
  banner: { js: banner },
});

const early = await build({
  entryPoints: ["scripts/inline/early-theme.ts"],
  bundle: true,
  format: "iife",
  target: "es2020",
  write: false,
  legalComments: "none",
  banner: { js: banner },
});

const source = early.outputFiles?.[0]?.text;
if (!source) {
  throw new Error("early-theme bundle was empty");
}

await mkdir("templates/partials/generated", { recursive: true });
await writeFile(
  "templates/partials/generated/early-theme.html",
  `<script>\n${source.trim()}\n</script>\n`,
);
