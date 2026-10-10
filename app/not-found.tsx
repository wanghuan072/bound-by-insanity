import Link from "@/src/components/layout/SiteLink";
export default function NotFound() {
  return (
    <main id="main-content" className="container">
      <h1>Page not found</h1>
      <p>This address does not have a published page.</p>
      <Link className="text-action" href="/" prefetch={false}>
        Return home →
      </Link>
    </main>
  );
}
