"use client";
import Image from "next/image";
import Link from "@/src/components/layout/SiteLink";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/src/config/site.mjs";
import { navigation, pageHref } from "@/src/config/navigation.mjs";
export default function SiteHeader() {
  const pathname = usePathname();
  const preview = pathname.startsWith("/__preview");
  const current = preview ? pathname.slice(10) || "/" : pathname;
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = header.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty(
        "--header-height",
        el.getBoundingClientRect().height + "px",
      );
    const observer = new ResizeObserver(update);
    observer.observe(el);
    update();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header ref={header} className="site-header">
      <div className="container header-inner">
        <Link
          href={pageHref("/", preview)}
          prefetch={false}
          className="brand"
          aria-label={site.name + " home"}
          onClick={() => setOpen(false)}
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
          ref={button}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen(!open)}
        >
          <span aria-hidden="true">☰</span> Menu
        </button>
        <nav
          id="primary-navigation"
          aria-label="Main navigation"
          className={open ? "navigation is-open" : "navigation"}
        >
          {navigation.map((x) => (
            <Link
              key={x.id}
              href={pageHref(x.path, preview)}
              prefetch={false}
              aria-current={
                (x.path === "/" ? current === "/" : current.startsWith(x.path))
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {x.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
