import { cp, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const outputDirectory = "2026-aml-or";
const imageExtensions = new Set([".avif", ".gif", ".ico", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);

async function copyPublicImages(sourceDirectory: string, destinationDirectory: string) {
  const entries = await readdir(sourceDirectory, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDirectory, entry.name);

    if (entry.isDirectory()) {
      await copyPublicImages(sourcePath, destinationDirectory);
      continue;
    }

    if (!imageExtensions.has(path.extname(entry.name).toLowerCase())) continue;

    await cp(sourcePath, path.join(destinationDirectory, entry.name));
  }
}

function ftpExport(): Plugin {
  return {
    name: "ftp-export",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("app/page.tsx")) return null;

      return code.replaceAll("./assets/", "./images/");
    },
    transformIndexHtml(html) {
      return html
        .replace('    <link rel="icon" type="image/svg+xml" href="./openrice-favicon.svg" />', '    <link rel="icon" type="image/svg+xml" href="./images/openrice-favicon.svg" />')
        .replace('    <link rel="canonical" href="https://twopenrice-ops.github.io/" />\n', "")
        .replace('    <meta property="og:url" content="https://twopenrice-ops.github.io/" />\n', "")
        .replaceAll("https://twopenrice-ops.github.io/og.png", "./images/og.png");
    },
    async closeBundle() {
      const destinationDirectory = path.resolve(outputDirectory, "images");
      await mkdir(destinationDirectory, { recursive: true });
      await copyPublicImages(path.resolve("public"), destinationDirectory);
    },
  };
}

export default defineConfig({
  base: "./",
  publicDir: false,
  plugins: [ftpExport(), react()],
  build: {
    outDir: outputDirectory,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "static/[name]-[hash].js",
        chunkFileNames: "static/[name]-[hash].js",
        assetFileNames: ({ names }) => {
          const extension = path.extname(names[0] ?? "").toLowerCase();
          return imageExtensions.has(extension)
            ? "images/[name]-[hash][extname]"
            : "static/[name]-[hash][extname]";
        },
      },
    },
  },
});
