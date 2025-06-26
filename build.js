import { build } from "esbuild";

async function buildProject() {
  try {
    await build({
      entryPoints: ["./src/index.ts"],
      outfile: "dist/build.js",
      bundle: true,
      platform: "node",       // Ensures Node.js standard libs are included
      target: ["node14"],     // Use `node14` for best compatibility with FiveM
      sourcemap: false,       
      minify: false,

      // Avoid bundling native or optional Node.js deps
      external: [
        "bson",               // Used by mongodb
        "dns", "fs", "net", "tls", "buffer", "crypto", "stream", "zlib", "http", "https"
      ],
    });

    console.log("✅ Build succeeded!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

buildProject();
