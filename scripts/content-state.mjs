import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { format } from "prettier";
import { staticTDK } from "../seo/tdk.js";
import { contentSnapshots } from "../src/lib/content-snapshots.mjs";
import { validDate } from "../src/lib/schema.mjs";
const load = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
const main = await load("data/games/main-game.json"),
  topics = await Promise.all(
    ["characters", "endings"].map((id) => load("data/topics/" + id + ".json")),
  ),
  legal = await load("data/legal/pages.json"),
  site = await load("data/site/generated-site.json");
const ledger = await load("research/media-ledger.json"),
  mediaHashes = {};
for (const m of ledger.filter((x) => x.status === "adopted" && x.localPath)) {
  const bytes = await fs.readFile("public" + m.localPath);
  mediaHashes[m.localPath] = createHash("sha256").update(bytes).digest("hex");
}
const current = contentSnapshots({
    main,
    topics,
    legal,
    staticTDK,
    site,
    mediaHashes,
  }),
  previous = await load("seo/page-lastmod.json");
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
}).format(new Date());
const update = process.argv[2] === "update",
  next = {},
  changed = [];
for (const [id, page] of Object.entries(current)) {
  const old = previous[id],
    matches = old?.hash === page.hash;
  if (!update && !matches)
    throw Error(
      "Stale visible content fingerprint: " +
        id +
        ". Run content:update deliberately.",
    );
  const record = page.kind === "game" ? main : null;
  const date = matches ? (record?.updatedAt ?? old.date) : today;
  if (!validDate(date) || date > today)
    throw Error("Invalid/future content date: " + id);
  if (record) {
    if (update && !matches) {
      record.updatedAt = today;
      changed.push(id);
    }
    next[id] = { ...page };
  } else {
    next[id] = { ...page, date };
    if (!matches) changed.push(id);
  }
}
if (!update && Object.keys(previous).some((id) => !current[id]))
  throw Error("Removed page left in date state");
if (update) {
  if (changed.includes(main.id))
    await fs.writeFile(
      "data/games/main-game.json",
      await format(JSON.stringify(main), { parser: "json" }),
    );
  await fs.writeFile(
    "seo/page-lastmod.json",
    JSON.stringify(next, null, 2) + "\n",
  );
}
console.log(
  JSON.stringify(
    {
      mode: update ? "update" : "verify",
      pages: Object.keys(current).length,
      changed,
      today,
    },
    null,
    2,
  ),
);
