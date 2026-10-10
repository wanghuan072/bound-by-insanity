import Link from "@/src/components/layout/SiteLink";
import Image from "next/image";
import { site } from "@/src/config/site.mjs";
import { navigation, legalNavigation } from "@/src/config/navigation.mjs";
export function StaticHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          prefetch={false}
          className="brand"
          href="/"
          aria-label={site.name + " home"}
        >
          <Image
            src={site.logo}
            alt={site.name}
            width={560}
            height={112}
            preload
            unoptimized
          />
        </Link>
        <button
          className="menu-toggle"
          disabled
          aria-label="Navigation loading"
        >
          Menu
        </button>
        <nav className="navigation" aria-label="Main navigation">
          {navigation.map((x) => (
            <Link prefetch={false} href={x.path} key={x.id}>
              {x.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
export function StaticFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link
            className="footer-brand"
            href="/"
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
            <Link prefetch={false} key={x.id} href={x.path}>
              {x.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Legal">
          <h2>Legal</h2>
          {legalNavigation.map((x) => (
            <Link
              prefetch={false}
              key={x.id}
              href={x.path}
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
