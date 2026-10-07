import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { build } from "esbuild";

await build({
  entryPoints: ["scripts/lib/base64.test.ts", "scripts/lib/search-index.test.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outdir: "build/test",
  outbase: "scripts/lib",
});

const testFiles = (await readdir("build/test"))
  .filter((name) => name.endsWith(".test.js"))
  .map((name) => `build/test/${name}`);

const child = spawn("node", ["--test", ...testFiles], { stdio: "inherit" });
const code = await new Promise((resolve, reject) => {
  child.on("error", reject);
  child.on("exit", resolve);
});
process.exit(code ?? 1);
