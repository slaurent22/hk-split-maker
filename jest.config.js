export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
    "^.+\\.(txt|lss|txt\\?raw)$": "<rootDir>/tests/loaders/text-transformer.js",
  },
  moduleNameMapper: {
    "\\.css$": "<rootDir>/tests/__mocks__/styleMock.cjs",
    "\\.(jpg|jpeg|png|gif|svg|webp)$": "<rootDir>/tests/__mocks__/fileMock.cjs",
    "^(.*)\\?raw$": "$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverage: false, // Set to true or use --coverage flag
  collectCoverageFrom: ["src/lib/lss.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/", "/dist/"],
};
