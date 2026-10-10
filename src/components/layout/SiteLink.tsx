// Full document navigation is intentional after the cached route retained an active game iframe.
import type { AnchorHTMLAttributes } from "react";
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
};
export default function SiteLink({ prefetch, ...props }: Props) {
  void prefetch;
  return <a {...props} />;
}
