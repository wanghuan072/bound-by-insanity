import { site } from "./site.mjs";
export const navigation = site.navigation;
export const legalNavigation = site.legal;
export const pageHref = (pathname, preview = false) =>
  preview ? "/__preview" + (pathname === "/" ? "" : pathname) : pathname;
