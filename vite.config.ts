import { execSync } from "node:child_process";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

function git(command: string): string {
  return execSync(`git ${command}`, { encoding: "utf8" }).trim();
}

export default defineConfig(() => {
  process.env.VITE_GIT_VERSION = git("describe --always");

  return {
    build: {
      outDir: "dist",
      sourcemap: true,
    },
    plugins: [
      react(),
      nodePolyfills({
        globals: {
          Buffer: true,
          process: true,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      port: 8080,
    },
  };
});
