import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import {
  inspectOwnedPreview,
  removeOwnedPreview,
  previewMarker,
} from "./owned-preview.mjs";
const { route: directory, file } = await inspectOwnedPreview();
const marker = previewMarker;
await fs.mkdir(directory, { recursive: true });
await fs.writeFile(
  file,
  marker +
    '\nexport {default} from \"@/dev/PreviewPage\";\nexport const metadata={robots:{index:false,follow:false}};\nexport const generateStaticParams=()=>[{segments:[]},{segments:[\"characters\"]},{segments:[\"endings\"]}];\n',
);
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      BBI_ISOLATED_PREVIEW: "1",
    },
  },
);
let stopping = false;
async function cleanup() {
  if (stopping) return;
  stopping = true;
  try {
    await removeOwnedPreview();
  } catch (e) {
    if (e.code !== "ENOENT") console.error(e);
  }
}
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    child.kill(signal);
    void cleanup();
  });
child.on("exit", async (code) => {
  await cleanup();
  process.exitCode = code ?? 1;
});
