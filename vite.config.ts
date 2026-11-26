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
    plugins: [
      react(),
      nodePolyfills({
        globals: {
          process: true,
          Buffer: true,
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
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
