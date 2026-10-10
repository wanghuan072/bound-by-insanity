import config from "../../data/site/generated-site.json" with { type: "json" };
export const site = Object.freeze(config);
export const contactEmail = site.contactEmail;
export const canonical = (pathname) => new URL(pathname, site.origin).href;
