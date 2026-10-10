import { frameOrigin } from "./url-policy.mjs";
export function contentSecurityPolicy(
  main,
  videos = false,
  development = false,
) {
  const origin = frameOrigin(main.player.iframeSrc);
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'none'",
    "script-src 'self' 'unsafe-inline'" + (development ? " 'unsafe-eval'" : ""),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'" +
      (development ? " ws://localhost:* ws://127.0.0.1:*" : ""),
    "frame-src " +
      ([origin, videos ? "https://www.youtube-nocookie.com" : null]
        .filter(Boolean)
        .join(" ") || "'none'"),
  ].join("; ");
}
