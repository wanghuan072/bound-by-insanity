import { spawnSync } from "node:child_process";
for (const args of [
  ["node_modules/next/dist/bin/next", "typegen"],
  [
    "node_modules/typescript/bin/tsc",
    "--project",
    "tsconfig.check.json",
    "--noEmit",
  ],
]) {
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: { ...process.env, BBI_TYPECHECK: "1", NEXT_TELEMETRY_DISABLED: "1" },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
