/* eslint-disable */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.cwd();
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", ".vscode"]);

let hasErrors = false;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        walk(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      try {
        console.log(`Checking ${entry.name}`);
        const content = fs.readFileSync(fullPath, "utf8");
        JSON.parse(content);
      } catch (err) {
        hasErrors = true;
        console.error(`❌ Invalid JSON: ${fullPath}`);
        console.error(`   ${err.message}`);
      }
    }
  }
}

walk(ROOT_DIR);

if (hasErrors) {
  console.error("\nOne or more JSON files are invalid.");
  process.exit(1);
} else {
  console.log("✅ All JSON files are valid.");
  process.exit(0);
}
