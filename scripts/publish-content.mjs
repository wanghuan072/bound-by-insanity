import fs from "node:fs/promises";
import { spawnSync } from "node:child_process";
const files = [
  "data/games/main-game.json",
  "data/topics/characters.json",
  "data/topics/endings.json",
  "seo/page-lastmod.json",
];
const originals = await Promise.all(files.map((p) => fs.readFile(p, "utf8")));
const run = (args) => {
  const r = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (r.status !== 0)
    throw Error("Publication batch check failed: " + args.join(" "));
};
run(["scripts/validate-content.mjs", "media"]);
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
}).format(new Date());
try {
  for (const [i, p] of files.slice(0, -1).entries()) {
    const d = JSON.parse(originals[i]);
    if (d.status !== "published") {
      d.status = "published";
      if ("publishedAt" in d) {
        d.publishedAt = today;
        d.updatedAt = today;
      }
    }
    await fs.writeFile(p, JSON.stringify(d, null, 2) + "\n");
  }
  run(["scripts/content-state.mjs", "update"]);
  run(["scripts/validate-content.mjs", "publish"]);
  run(["scripts/content-state.mjs", "verify"]);
  console.log(
    "One atomic local public-route batch passed; no website deployed.",
  );
} catch (error) {
  for (const [i, p] of files.entries()) await fs.writeFile(p, originals[i]);
  throw error;
}
