import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
const manifest = JSON.parse(
  await fs.readFile("artifacts/production/deployment-manifest.json", "utf8"),
);
const port = Number(process.env.BBI_PREVIEW_PORT ?? 58610),
  origin = "http://127.0.0.1:" + port,
  log = "reports/logs/production-preview.log";
const child = spawn(process.execPath, ["server.js"], {
  cwd: path.resolve("artifacts/production"),
  env: {
    ...process.env,
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    NODE_ENV: "production",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
for (const stream of [child.stdout, child.stderr])
  stream.on("data", (b) => {
    output += b;
    process.stdout.write(b);
  });
let ready = false;
for (let i = 0; i < 80; i++) {
  try {
    const res = await fetch(origin);
    if (
      res.status === 200 &&
      res.headers.get("x-bbi-build-id") === manifest.buildId
    ) {
      ready = true;
      break;
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 200));
}
await fs.writeFile(log, output);
const report = JSON.parse(
  await fs.readFile("reports/command-results.json", "utf8"),
);
const entry = {
  id: "production-preview-" + manifest.buildId,
  kind: "service",
  command: [process.execPath, "server.js"],
  cwd: path.resolve("artifacts/production"),
  pid: child.pid,
  wrapperPid: process.pid,
  port,
  origin,
  readiness: ready ? "ready-current-build" : "failed",
  buildId: manifest.buildId,
  startedAt: new Date().toISOString(),
  exitCode: null,
  log,
  stopMethod: "SIGINT wrapper; owned child only",
  stoppedAt: null,
};
report.entries.push(entry);
await fs.writeFile(
  "reports/command-results.json",
  JSON.stringify(report, null, 2) + "\n",
);
if (!ready) {
  child.kill();
  throw Error("Current production build did not become ready");
}
console.log("READY_CURRENT_BUILD " + manifest.buildId);
const stop = () => child.kill();
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("exit", async (code, signal) => {
  await fs.writeFile(log, output);
  const r = JSON.parse(
    await fs.readFile("reports/command-results.json", "utf8"),
  );
  const e = r.entries.find((x) => x.id === entry.id);
  Object.assign(e, {
    exitCode: code,
    signal,
    stoppedAt: new Date().toISOString(),
  });
  await fs.writeFile(
    "reports/command-results.json",
    JSON.stringify(r, null, 2) + "\n",
  );
});
