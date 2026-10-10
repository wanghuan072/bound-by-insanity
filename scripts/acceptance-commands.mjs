import { runRecorded } from "./command-recorder.mjs";
import fs from "node:fs/promises";
const commands = [
  ["validate", ["scripts/validate-content.mjs", "publish"]],
  ["media", ["scripts/validate-content.mjs", "media"]],
  ["dates", ["scripts/content-state.mjs", "verify"]],
  [
    "format",
    [
      "node_modules/prettier/bin/prettier.cjs",
      "--check",
      "app",
      "src",
      "dev",
      "scripts",
      "tests",
      "seo",
      "data",
      "next.config.ts",
      "package.json",
      "tsconfig.json",
      "tsconfig.check.json",
      "tsconfig.production.json",
    ],
  ],
  [
    "lint",
    [
      "node_modules/eslint/bin/eslint.js",
      "app",
      "src",
      "dev",
      "scripts",
      "tests",
      "seo",
      "next.config.ts",
    ],
  ],
  ["typecheck", ["scripts/typecheck.mjs"]],
  [
    "test",
    [
      "--test",
      ...(await fs.readdir("tests"))
        .filter((p) => p.endsWith(".test.mjs"))
        .map((p) => "tests/" + p),
    ],
  ],
  ["build", ["scripts/build-production.mjs"]],
];
for (const [name, args] of commands) {
  if ((await runRecorded("flow-10-final-" + name, args)) !== 0) {
    process.exitCode = 1;
    break;
  }
}
