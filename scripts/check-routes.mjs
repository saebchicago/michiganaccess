// Verify all routes in routes.ts have page files
// Run: node scripts/check-routes.mjs

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const routesContent = readFileSync("src/config/routes.ts", "utf-8");
const pattern = /import\("@\/pages\/([^"]+)"\)/g;
const components = [];
let match;
while ((match = pattern.exec(routesContent)) !== null) {
  components.push(match[1]);
}

let errors = 0;
console.log(`Checking ${components.length} page components...`);

for (const component of components) {
  const filePath = join("src/pages", `${component}.tsx`);
  if (!existsSync(filePath)) {
    console.error(`\u274C MISSING: ${filePath}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} missing page(s) found!`);
  process.exit(1);
} else {
  console.log(`\n\u2705 All ${components.length} routes have corresponding page files`);
}
