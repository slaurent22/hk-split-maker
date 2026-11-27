import { execSync } from "node:child_process";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function git(command: string): string {
  return execSync(`git ${command}`, { encoding: "utf8" }).trim();
}

export default defineConfig(() => {
  process.env.VITE_GIT_VERSION = git("describe --always");

  return {
    plugins: [react()],
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
