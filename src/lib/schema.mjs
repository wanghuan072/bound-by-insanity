import { localImagePath } from "./url-policy.mjs";
const assert = (ok, message) => {
  if (!ok) throw new Error(message);
};
const size = (value) => [...value].length;
export function keys(value, allowed, label) {
  assert(
    value && typeof value === "object" && !Array.isArray(value),
    label + ": object required",
  );
  assert(
    Object.keys(value).every((k) => allowed.includes(k)) &&
      allowed.every((k) => k in value),
    label + ": missing or unknown field",
  );
}
function text(value, min, max, label) {
  assert(
    typeof value === "string" &&
      value === value.trim() &&
      size(value) >= min &&
      size(value) <= max &&
      !/<[^>]*>|https?:\/\/|\]\(/iu.test(value),
    label + ": invalid plain text",
  );
}
const slug = (value) =>
  typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
function unique(values, label) {
  assert(
    Array.isArray(values) && new Set(values).size === values.length,
    label + ": duplicate or invalid array",
  );
}
export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const d = new Date(value + "T00:00:00Z");
  return (
    !isNaN(d.valueOf()) &&
    d.toISOString().slice(0, 10) === value &&
    value <=
      new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(
        new Date(),
      )
  );
}
export function validateSEO(seo, keyword) {
  keys(
    seo,
    "keywords" in seo
      ? ["title", "description", "keywords"]
      : ["title", "description"],
    "seo",
  );
  text(seo.title, 40, 60, "seo.title");
  text(seo.description, 140, 160, "seo.description");
  if ("keywords" in seo) {
    unique(seo.keywords, "seo.keywords");
    assert(
      seo.keywords.length >= 1 && seo.keywords.length <= 8,
      "seo.keywords count",
    );
    seo.keywords.forEach((value) => text(value, 2, 80, "seo.keyword"));
    if (keyword)
      assert(seo.keywords.includes(keyword), "Keywords miss exact game name");
  }
  if (keyword)
    assert(
      seo.title.includes(keyword) && seo.description.includes(keyword),
      "SEO misses exact game name",
    );
}
export function validateImage(image, strict = false) {
  keys(image, ["src", "alt", "width", "height"], "image");
  assert(
    (image.src === "" && !strict) || localImagePath(image.src),
    "invalid local image",
  );
  text(image.alt, strict ? 8 : 0, 180, "alt");
  for (const key of ["width", "height"])
    assert(
      (image[key] === null && !strict) ||
        (Number.isInteger(image[key]) && image[key] > 0 && image[key] <= 20000),
      "image " + key,
    );
}
export function validateLegal(page) {
  keys(page, ["id", "title", "blocks", "sections"], "legal");
  assert(
    ["privacy", "terms", "copyright", "about", "contact"].includes(page.id),
    "Unknown Legal identity",
  );
  text(page.title, 3, 80, "Legal title");
  assert(
    Array.isArray(page.blocks) && page.blocks.length > 0,
    "Legal introduction required",
  );
  page.blocks.forEach((block) => validateBlock(block, true));
  assert(
    Array.isArray(page.sections) && page.sections.length >= 3,
    "Complete Legal sections required",
  );
  const ids = [];
  for (const section of page.sections) {
    keys(section, ["id", "title", "blocks"], "Legal section");
    assert(slug(section.id), "Legal section identity");
    ids.push(section.id);
    text(section.title, 3, 100, "Legal section title");
    assert(
      Array.isArray(section.blocks) && section.blocks.length > 0,
      "Empty Legal section",
    );
    section.blocks.forEach((block) => validateBlock(block, true));
  }
  unique(ids, "Legal section IDs");
  return page;
}
export function validateBlock(block, strict = false, game = false) {
  const required = {
    paragraph: ["type", "text"],
    image: ["type", "src", "alt", "width", "height"],
    list: ["type", "style", "items"],
    steps: ["type", "items"],
    callout: ["type", "tone", "body"],
    table: ["type", "columns", "rows"],
    video: ["type", "provider", "videoId", "title", "description"],
    faq: ["type", "items"],
  }[block.type];
  assert(required && (game || block.type !== "faq"), "unknown content block");
  const optional =
    { image: ["caption"], callout: ["label"], video: ["poster"] }[block.type] ??
    [];
  keys(block, [...required, ...optional.filter((k) => k in block)], "block");
  if (block.type === "paragraph") text(block.text, 20, 4000, "paragraph");
  if (block.type === "image") {
    const { src, alt, width, height } = block;
    validateImage({ src, alt, width, height }, strict);
    if (block.caption) text(block.caption, 3, 240, "caption");
  }
  if (block.type === "callout") {
    assert(["info", "tip", "warning"].includes(block.tone), "callout tone");
    text(block.body, 10, 1200, "callout");
    if (block.label) text(block.label, 2, 60, "label");
  }
  if (["list", "steps", "faq"].includes(block.type)) {
    assert(
      Array.isArray(block.items) &&
        block.items.length >= (block.type === "steps" ? 2 : 1) &&
        block.items.length <= (block.type === "faq" ? 12 : 30),
      "item count",
    );
    if (block.type === "list") {
      assert(["ordered", "unordered"].includes(block.style), "list style");
      unique(block.items, "list");
      block.items.forEach((x) => text(x, 3, 600, "list item"));
    }
    if (block.type === "steps")
      for (const x of block.items) {
        keys(x, ["title", "body"], "step");
        text(x.title, 3, 120, "step title");
        text(x.body, 10, 1200, "step body");
      }
    if (block.type === "faq")
      for (const x of block.items) {
        keys(x, ["question", "answer"], "FAQ");
        text(x.question, 8, 240, "question");
        text(x.answer, 20, 1200, "answer");
      }
  }
  if (block.type === "table") {
    unique(block.columns, "columns");
    assert(
      block.columns.length >= 2 &&
        block.columns.length <= 8 &&
        block.rows.length >= 1 &&
        block.rows.length <= 50,
      "table size",
    );
    for (const row of block.rows) {
      assert(row.length === block.columns.length, "table width");
      row.forEach((x) => text(x, 1, 600, "table cell"));
    }
  }
  if (block.type === "video") {
    assert(
      block.provider === "youtube" && /^[A-Za-z0-9_-]{11}$/.test(block.videoId),
      "video ID",
    );
    text(block.title, 8, 160, "video title");
    text(block.description, 20, 500, "video description");
    if (block.poster) validateImage(block.poster, strict);
  }
}
export function validateRecord(record, kind, mode = "dev") {
  const strict = mode !== "dev";
  assert(["game", "topic"].includes(kind), "Unsupported content kind");
  const fields =
    kind === "game"
      ? [
          "id",
          "slug",
          "title",
          "shortDescription",
          "status",
          "publishedAt",
          "updatedAt",
          "tags",
          "categories",
          "spoilerPolicy",
          "flags",
          "image",
          "player",
          "content",
          "relatedGameIds",
        ]
      : [
          "id",
          "slug",
          "status",
          "title",
          "introduction",
          "tags",
          "spoilerPolicy",
          "cover",
          "sections",
          "relatedPageIds",
        ];
  keys(record, fields, kind);
  assert(slug(record.id) && slug(record.slug), "invalid stable identity");
  assert(["draft", "published"].includes(record.status), "status");
  assert(
    ["none", "marked", "full"].includes(record.spoilerPolicy),
    "spoiler policy",
  );
  text(record.title, 1, 120, "title");
  unique(record.tags, "tags");
  record.tags.forEach((x) => text(x, 1, 60, "tag"));
  if (strict)
    assert(
      record.tags.length >= 1 && record.tags.length <= 5,
      "published tags",
    );
  if (kind === "game") {
    for (const key of ["publishedAt", "updatedAt"])
      assert(
        (record[key] === null && record.status === "draft") ||
          validDate(record[key]),
        "invalid " + key,
      );
    if (record.publishedAt)
      assert(record.updatedAt >= record.publishedAt, "date order");
    if (mode === "publish")
      assert(record.status === "published", "unpublished record");
  }
  text(
    record[kind === "game" ? "shortDescription" : "introduction"],
    strict ? 40 : 0,
    kind === "game" ? 240 : 600,
    "introduction",
  );
  validateImage(record[kind === "game" ? "image" : "cover"], strict);
  if (kind === "game") {
    keys(
      record.flags,
      ["isNewHome", "isFeaturedHome", "isRecommendedHome"],
      "flags",
    );
    assert(
      Object.values(record.flags).every((x) => x === false),
      "additional-game scope is deferred",
    );
    unique(record.categories, "categories");
    assert(
      record.title === "Bound By Insanity" &&
        record.id === "bound-by-insanity" &&
        record.slug === record.id,
      "Main identity mismatch",
    );
    keys(
      record.player,
      [
        "iframeSrc",
        "aspectRatio",
        "orientation",
        "permissionsPolicy",
        "referrerPolicy",
        "sandbox",
        "loadTimeoutMs",
      ],
      "player",
    );
    assert(typeof record.player.iframeSrc === "string", "iframe config");
    assert(
      (record.player.aspectRatio === null && !strict) ||
        (typeof record.player.aspectRatio === "number" &&
          record.player.aspectRatio > 0),
      "aspect ratio",
    );
    assert(
      ["adaptive", "landscape", "portrait"].includes(record.player.orientation),
      "orientation",
    );
    unique(record.player.permissionsPolicy, "permissions");
    assert(
      Number.isInteger(record.player.loadTimeoutMs) &&
        record.player.loadTimeoutMs >= 1000 &&
        record.player.loadTimeoutMs <= 120000,
      "timeout",
    );
    assert(
      !record.player.sandbox ||
        !record.player.sandbox
          .split(/\s+/)
          .some((x) =>
            [
              "allow-popups",
              "allow-top-navigation",
              "allow-top-navigation-by-user-activation",
              "allow-popups-to-escape-sandbox",
            ].includes(x),
          ),
      "unsafe sandbox",
    );
    assert(
      record.player.sandbox
        .split(/\s+/)
        .every((x) =>
          ["allow-scripts", "allow-same-origin", "allow-pointer-lock"].includes(
            x,
          ),
        ),
      "Unknown sandbox capability",
    );
    assert(
      ["no-referrer", "strict-origin-when-cross-origin"].includes(
        record.player.referrerPolicy,
      ),
      "Invalid referrer policy",
    );
    if (strict)
      assert(
        record.player.sandbox && record.player.referrerPolicy,
        "missing player policy",
      );
    unique(record.relatedGameIds, "related games");
    assert(
      record.relatedGameIds.length === 0,
      "additional game relations deferred",
    );
  }
  if (kind === "topic") {
    unique(record.relatedPageIds, "related pages");
    assert(
      record.relatedPageIds.every((id) =>
        ["home", "characters", "endings"].includes(id),
      ),
      "Unknown related page",
    );
  }
  const sections = record[kind === "game" ? "content" : "sections"];
  assert(Array.isArray(sections), "sections");
  assert(!strict || sections.length >= 2, "incomplete sections");
  const ids = [];
  for (const section of sections) {
    keys(
      section,
      kind === "game" ? ["id", "heading", "blocks"] : ["id", "title", "blocks"],
      "section",
    );
    assert(slug(section.id), "section ID");
    ids.push(section.id);
    text(
      section[kind === "game" ? "heading" : "title"],
      3,
      120,
      "section title",
    );
    assert(section.blocks.length > 0, "empty section");
    section.blocks.forEach((x) => validateBlock(x, strict, kind === "game"));
  }
  unique(ids, "section IDs");
  return record;
}
export function bodyCount(sections) {
  return sections
    .map((s) =>
      s.blocks
        .filter((b) => !["image", "video"].includes(b.type))
        .map((b) =>
          b.type === "paragraph"
            ? b.text
            : b.type === "callout"
              ? b.body
              : b.type === "table"
                ? b.rows.flat().join(" ")
                : b.items
                    .map((x) =>
                      typeof x === "string" ? x : Object.values(x).join(" "),
                    )
                    .join(" "),
        )
        .join(" "),
    )
    .join(" ")
    .normalize("NFC")
    .replace(/\s/gu, "").length;
}
