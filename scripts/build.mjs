import { build } from "esbuild";
import { readdir } from "node:fs/promises";

const names = await readdir(new URL(".", import.meta.url));
const entryPoints = names
  .filter((name) => name.endsWith(".ts"))
  .map((name) => `scripts/${name}`);

await build({
  entryPoints,
  bundle: true,
  format: "iife",
  target: "es2020",
  outdir: "static/js",
  legalComments: "none",
  banner: {
    js: "/* Generated from scripts/*.ts. Edit the TypeScript source and run npm run build:js. */",
  },
});
