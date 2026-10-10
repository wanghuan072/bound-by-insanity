import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
const hash = createHash("sha256");
async function walk(dir) {
  for (const ent of (await fs.readdir(dir, { withFileTypes: true })).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(p);
    else if (p !== path.join("data", "site", "build-identity.json")) {
      hash.update(p.replaceAll(path.sep, "/"));
      hash.update(await fs.readFile(p));
    }
  }
}
for (const dir of ["app", "src", "data", "seo", "public"]) await walk(dir);
for (const p of ["next.config.ts", "package-lock.json"])
  hash.update(await fs.readFile(p));
const sourceHash = hash.digest("hex");
await fs.writeFile(
  "data/site/build-identity.json",
  JSON.stringify({ buildId: randomUUID(), sourceHash }, null, 2) + "\n",
);
