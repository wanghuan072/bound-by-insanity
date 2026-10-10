import fs from "node:fs/promises";
import path from "node:path";
const destination = path.resolve("artifacts/production");
if (!destination.startsWith(path.resolve("artifacts") + path.sep))
  throw Error("Packaging boundary");
await fs.rm(destination, { recursive: true, force: true });
await fs.mkdir(destination, { recursive: true });
await fs.cp(".next-production/standalone", destination, {
  recursive: true,
  dereference: true,
});
await fs.cp("public", path.join(destination, "public"), {
  recursive: true,
  dereference: true,
});
await fs.cp(
  ".next-production/static",
  path.join(destination, ".next-production/static"),
  {
    recursive: true,
    dereference: true,
  },
);
async function audit(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw Error("Unmaterialized link " + file);
    if (entry.isDirectory()) {
      if (
        !path
          .relative(destination, file)
          .split(path.sep)
          .includes("node_modules") &&
        ["research", "planning", "reports", "handoff", "dev", "tests"].includes(
          entry.name,
        )
      )
        throw Error("Internal directory leaked " + file);
      await audit(file);
    }
  }
}
await audit(destination);
console.log("Materialized standalone production package: " + destination);

const buildId = (await fs.readFile(".next-production/BUILD_ID", "utf8")).trim();
const state = JSON.parse(await fs.readFile("seo/page-lastmod.json", "utf8"));
await fs.writeFile(
  path.join(destination, "deployment-manifest.json"),
  JSON.stringify(
    {
      buildId,
      origin: "https://boundbyinsanity.org",
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      entry: "server.js",
      cacheDirectory: ".next-production",
      routes: Object.values(state).map((x) => ({
        path: x.path,
        contentHash: x.hash,
      })),
      materialized: true,
      deployStatus: "not-deployed",
    },
    null,
    2,
  ) + "\n",
);
