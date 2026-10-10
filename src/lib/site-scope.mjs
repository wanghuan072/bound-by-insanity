import fs from "node:fs/promises";
import assert from "node:assert/strict";

// The user-approved public collection, including the sole main-game URL.
export const publicPaths = [
  "/",
  "/characters",
  "/endings",
  "/privacy",
  "/terms",
  "/copyright",
  "/about",
  "/contact",
];
const ordered = (items) => [...items].sort();

export function validatePublicScope(map, registry) {
  assert.deepEqual(
    map.primaryNavigation.map(({ label, path }) => [label, path]),
    [
      ["Home", "/"],
      ["Characters", "/characters"],
      ["Endings", "/endings"],
    ],
    "Navigation must match the approved three pages",
  );
  assert.deepEqual(
    map.utilityPages.map(({ path }) => path),
    publicPaths.slice(3),
    "Five root Legal pages required",
  );
  assert.equal(registry.main.path, "/", "Main game owns the homepage only");
  assert.equal(registry.main.dataFile, "data/games/main-game.json");
  assert.ok(
    !("guides" in registry) && !("additionalGameRoutes" in registry),
    "Removed route collections must not remain active",
  );
  assert.deepEqual(
    ordered([registry.main, ...registry.staticPages].map(({ path }) => path)),
    ordered(publicPaths),
    "Route registry must contain exactly the eight approved pages",
  );
  assert.deepEqual(
    ordered(map.pages.map(({ path }) => path)),
    ordered(publicPaths),
    "Content map must match the public collection",
  );
  for (const link of map.internalLinks)
    assert.ok(
      publicPaths.includes(link.path),
      "Internal link outside current scope: " + link.path,
    );
}

export async function validateRouteFiles(mode = "publish", directory = "app") {
  const routes = [];
  async function walk(current, segments = []) {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const name = entry.name;
      if (entry.isDirectory()) {
        if (name === "%5F_preview" && mode === "dev") continue;
        await walk(current + "/" + name, [...segments, name]);
      } else if (/^page\.(?:js|jsx|ts|tsx)$/.test(name)) {
        const url = "/" + segments.filter((s) => !/^\(.+\)$/.test(s)).join("/");
        assert.ok(
          publicPaths.includes(url),
          "Unexpected public route file: " + current + "/" + name,
        );
        routes.push(url);
      }
    }
  }
  await walk(directory);
  assert.deepEqual(
    ordered(routes),
    ordered(publicPaths),
    "Actual App Router pages must match the approved collection",
  );
  return routes;
}
