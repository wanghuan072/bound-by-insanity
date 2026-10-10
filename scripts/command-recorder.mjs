import fs from "node:fs/promises";
import { spawn } from "node:child_process";
export async function runRecorded(id, args) {
  const startedAt = new Date().toISOString();
  const logfile = "reports/logs/" + id + ".log";
  await fs.mkdir("reports/logs", { recursive: true });
  let output = "";
  const child = spawn(process.execPath, args, {
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  for (const stream of [child.stdout, child.stderr])
    stream.on("data", (chunk) => {
      output += chunk;
      process.stdout.write(chunk);
    });
  const exitCode = await new Promise((resolve) => child.on("exit", resolve));
  await fs.writeFile(logfile, output);
  let report;
  try {
    report = JSON.parse(
      await fs.readFile("reports/command-results.json", "utf8"),
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    report = { entries: [] };
  }
  report.entries.push({
    id,
    kind: "one-shot",
    command: [process.execPath, ...args],
    cwd: process.cwd(),
    startedAt,
    endedAt: new Date().toISOString(),
    pid: child.pid,
    exitCode,
    log: logfile,
    tests: Number(output.match(/(?:ℹ|#) tests (\d+)/)?.[1] ?? 0) || null,
  });
  await fs.writeFile(
    "reports/command-results.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  return exitCode;
}
if (process.argv[1]?.endsWith("command-recorder.mjs"))
  process.exitCode = await runRecorded(process.argv[2], process.argv.slice(3));
