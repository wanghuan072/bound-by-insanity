"use client";
import { useEffect, useRef } from "react";
export default function BoundaryRail({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    let previous = window.scrollY,
      top = 0,
      tick = 0;
    const measure = () => {
      const header =
        document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const upper = header + 16;
      if (window.innerWidth <= 768) {
        rail.style.top = "";
        top = upper;
        return;
      }
      const lower = Math.min(
        upper,
        window.innerHeight - rail.getBoundingClientRect().height - 16,
      );
      top = Math.max(lower, Math.min(upper, top || upper));
      rail.style.top = top + "px";
    };
    const scroll = () => {
      const delta = window.scrollY - previous;
      previous = window.scrollY;
      if (window.innerWidth <= 768) return;
      const upper =
        (document.querySelector("header")?.getBoundingClientRect().height ??
          0) + 16;
      const lower = Math.min(
        upper,
        window.innerHeight - rail.getBoundingClientRect().height - 16,
      );
      top =
        lower === upper ? upper : Math.max(lower, Math.min(upper, top - delta));
      rail.style.top = top + "px";
    };
    const schedule = () => {
      if (!tick)
        tick = requestAnimationFrame(() => {
          tick = 0;
          scroll();
        });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    const header = document.querySelector("header");
    if (header) observer.observe(header);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(tick);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, []);
  return (
    <aside ref={ref} className="task-rail" aria-label="Continue with the game">
      {children}
    </aside>
  );
}
