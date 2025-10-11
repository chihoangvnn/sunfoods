const esbuild = require("esbuild");
esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outdir: "dist",
  external: ["@neondatabase/serverless", "@google/genai", "canvas", "firebase-admin", "bullmq", "ioredis", "bcrypt", "lightningcss", "vite"]
}).catch(() => process.exit(1));
