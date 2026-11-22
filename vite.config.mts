import react from "@vitejs/plugin-react";
import { execSync } from "child_process";
import path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

function git(command: string) {
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
