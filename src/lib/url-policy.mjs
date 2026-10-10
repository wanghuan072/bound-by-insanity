export function safeFrameURL(value) {
  if (
    typeof value !== "string" ||
    !value ||
    value !== value.trim() ||
    /[\u0000-\u0020\u007f]/u.test(value)
  )
    return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}
export const frameOrigin = (value) => safeFrameURL(value)?.origin ?? null;
export function localImagePath(value) {
  return (
    typeof value === "string" &&
    /^\/images\/[a-zA-Z0-9/_-]+\.(avif|gif|jpe?g|png|svg|webp)$/.test(value) &&
    !value.includes("..")
  );
}
