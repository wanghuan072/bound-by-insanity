import Link from "@/src/components/layout/SiteLink";
import { pageHref } from "@/src/config/navigation.mjs";
export default function Breadcrumbs({
  items,
  preview = false,
}: {
  items: { label: string; path?: string }[];
  preview?: boolean;
}) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {items.map((x, i) => (
          <li key={x.label}>
            {x.path ? (
              <Link href={pageHref(x.path, preview)} prefetch={false}>
                {x.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined}>
                {x.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
