import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: ["src/**/*.d.ts", "src/asset/**/icons.ts", "src/schema/**"],
      include: ["src/**/*.ts"], // change ts to {ts, tsx} if and when we test tsx files
    },
    environment: "node",
    sequence: {
      concurrent: true,
    },
  },
});
