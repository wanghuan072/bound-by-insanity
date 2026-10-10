"use client";
import { usePathname } from "next/navigation";
import Link from "@/src/components/layout/SiteLink";
import { site } from "@/src/config/site.mjs";
import Image from "next/image";
import {
  navigation,
  legalNavigation,
  pageHref,
} from "@/src/config/navigation.mjs";
export default function SiteFooter({ preview = false }: { preview?: boolean }) {
  const pathname = usePathname();
  preview = preview || pathname.startsWith("/__preview");
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link
            className="footer-brand"
            href={pageHref("/", preview)}
            prefetch={false}
            aria-label={site.name + " home"}
          >
            <Image
              src={site.logo}
              alt={site.name}
              width={560}
              height={112}
              unoptimized
            />
          </Link>
          <p>A place to play, reread and make sense of the demo.</p>
        </div>
        <nav aria-label="Footer explore">
          <h2>Explore</h2>
          {navigation.map((x) => (
            <Link key={x.id} href={pageHref(x.path, preview)} prefetch={false}>
              {x.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Legal">
          <h2>Legal</h2>
          {legalNavigation.map((x) => (
            <Link
              key={x.id}
              href={pageHref(x.path, preview)}
              prefetch={false}
              rel="noopener noreferrer nofollow"
            >
              {x.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="container copyright">
        <div>
          Copyright © {site.copyrightYear} {site.name}. All rights reserved.
        </div>
        <div>{site.fanNotice}</div>
      </div>
    </footer>
  );
}
