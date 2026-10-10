import { validatePublicScope } from "../src/lib/site-scope.mjs";
import { format } from "prettier";
import fs from "node:fs/promises";
import yaml from "js-yaml";
import { createHash } from "node:crypto";
const files = [
  "project.yaml",
  "planning/content-map.json",
  "planning/route-registry.json",
  "planning/site-capabilities.json",
];
const inputs = await Promise.all(files.map((p) => fs.readFile(p, "utf8")));
const project = yaml.load(inputs[0]),
  map = JSON.parse(inputs[1]),
  registry = JSON.parse(inputs[2]),
  capabilities = JSON.parse(inputs[3]);
validatePublicScope(map, registry);
const config = {
  copyrightYear: new Date().getFullYear(),
  name: map.siteIdentity.site_name,
  shortName: map.siteIdentity.short_name,
  language: project.project.language,
  origin: project.domain.origin,
  logo: "/images/logo.png",
  socialImage: "/images/og-image.png",
  contactEmail: capabilities.contact.display,
  fanNotice: capabilities.siteRelationship.disclaimer,
  navigation: map.primaryNavigation.map((x) => ({
    id: x.page_id,
    label: x.label,
    path: x.path,
  })),
  legal: map.utilityPages.map((x) => ({
    id: x.page_id,
    label: x.label,
    path: x.path,
  })),
  routes: [
    { id: "home", path: "/", type: "game" },
    ...registry.staticPages,
  ].map(({ id, path, type }) => ({ id, path, type })),
  sourceHash: createHash("sha256").update(inputs.join("\n")).digest("hex"),
};
await fs.mkdir("data/site", { recursive: true });
await fs.writeFile(
  "data/site/generated-site.json",
  await format(JSON.stringify(config), { parser: "json" }),
);
console.log("Generated minimal runtime site configuration.");

for (const [id, file, source, data] of [
  [
    "home",
    "app/page.tsx",
    "@/src/page/home/HomeRoute",
    "data/games/main-game.json",
  ],
  [
    "characters",
    "app/characters/page.tsx",
    "@/src/page/topics/CharactersRoute",
    "data/topics/characters.json",
  ],
  [
    "endings",
    "app/endings/page.tsx",
    "@/src/page/topics/EndingsRoute",
    "data/topics/endings.json",
  ],
]) {
  const record = JSON.parse(await fs.readFile(data, "utf8"));
  if (record.status === "published") {
    await fs.mkdir(file.slice(0, file.lastIndexOf("/")), { recursive: true });
    await fs.writeFile(
      file,
      await format(
        "// OWNED_PUBLISHED_CONTENT_ROUTE\nexport {default," +
          (id === "home" ? "generateMetadata" : "metadata") +
          "} from " +
          JSON.stringify(source) +
          ";\n",
        { parser: "typescript" },
      ),
    );
  } else {
    try {
      const value = await fs.readFile(file, "utf8");
      if (!value.startsWith("// OWNED_PUBLISHED_CONTENT_ROUTE"))
        throw Error("Unexpected route " + file);
      await fs.rm(file);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
  }
}
