import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      include: ["src/**/*.ts"], // change ts to {ts, tsx} if and when we test tsx files
      exclude: ["src/**/*.d.ts", "src/asset/**/icons.ts", "src/schema/**"],
    },
    sequence: {
      concurrent: true,
    },
  },
});
