import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read the root package.json
const rootPackageJson = JSON.parse(
  readFileSync(join(__dirname, "package.json"), "utf-8"),
);

// Build configuration
const buildConfig = {
  entryPoints: ["src/handler.ts"],
  bundle: true,
  platform: "node",
  target: "node24",
  format: "cjs",
  outfile: "dist/mcp-lambda/index.js",
  external: ["@aws-sdk/*"],
  sourcemap: true,
  minify: false,
  metafile: true,
};

async function build() {
  console.log("🔨 Building Lambda package...\n");

  try {
    // Run esbuild
    const result = await esbuild.build(buildConfig);

    // Log build stats
    if (result.metafile) {
      const outputs = Object.keys(result.metafile.outputs);
      console.log("📦 Output files:");
      for (const output of outputs) {
        const size = result.metafile.outputs[output].bytes;
        console.log(`   ${output} (${formatBytes(size)})`);
      }
    }

    // Create minimal package.json for Lambda
    const lambdaPackageJson = {
      name: rootPackageJson.name,
      version: rootPackageJson.version,
      description: rootPackageJson.description,
      type: "commonjs",
      main: "index.js",
      license: rootPackageJson.license,
    };

    const outputDir = dirname(buildConfig.outfile);
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(
      join(outputDir, "package.json"),
      JSON.stringify(lambdaPackageJson, null, 2) + "\n",
    );

    console.log("\n📄 Created minimal package.json for Lambda");
    console.log("\n✅ Build completed successfully!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

build();
