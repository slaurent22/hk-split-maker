// eslint-disable-next-line no-undef
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
    "^.+\\.(txt|lss)$": "<rootDir>/src/tests/loaders/text-transformer.js",
  },
  moduleNameMapper: {
    "\\.css$": "<rootDir>/src/tests/__mocks__/styleMock.js",
    "\\.(jpg|jpeg|png|gif|svg|webp)$":
      "<rootDir>/src/tests/__mocks__/fileMock.js",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverage: false, // Set to true or use --coverage flag
  collectCoverageFrom: ["src/lib/lss.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/", "/dist/"],
};
