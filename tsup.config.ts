import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"], // outputs dist/server.js (cjs) + dist/server.mjs (esm)
  target: "node22",
  outDir: "dist",
  clean: true,
  bundle: true,
  splitting: false,
  sourcemap: true,

  // Fix require() compatibility — ESM build only.
  banner: ({ format }) =>
    format === "esm"
      ? {
          js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
        }
      : {},
});