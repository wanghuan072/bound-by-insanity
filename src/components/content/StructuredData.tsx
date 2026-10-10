import JsonLd from "./JsonLd";
import { pageGraph } from "@/src/seo/structured-data.mjs";
export default function StructuredData({
  id,
  path,
}: {
  id: string;
  path: string;
}) {
  return <JsonLd data={pageGraph(id, path)} />;
}
