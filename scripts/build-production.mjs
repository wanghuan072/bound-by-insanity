import { spawnSync } from "node:child_process";
import { removeOwnedPreview } from "./owned-preview.mjs";
await removeOwnedPreview();
for (const args of [
  ["scripts/generate-site-config.mjs"],
  ["scripts/validate-content.mjs", "publish"],
  ["scripts/content-state.mjs", "verify"],
  ["scripts/generate-build-identity.mjs"],
  ["node_modules/next/dist/bin/next", "build"],
  ...(process.env.VERCEL === "1" ? [] : [["scripts/package-production.mjs"]]),
]) {
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
