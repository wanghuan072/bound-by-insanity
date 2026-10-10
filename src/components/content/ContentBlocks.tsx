import LocalImage from "./LocalImage";
import type { Block } from "@/src/types/game";
export default function ContentBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks
        .filter((x) => x.type !== "video")
        .map((b, i) => {
          switch (b.type) {
            case "paragraph":
              return <p key={i}>{b.text}</p>;
            case "image":
              return (
                <figure
                  key={i}
                  className={
                    typeof b.height === "number" &&
                    typeof b.width === "number" &&
                    b.height > b.width
                      ? "portrait-figure"
                      : undefined
                  }
                >
                  <LocalImage image={b} />
                  {b.caption && <figcaption>{b.caption}</figcaption>}
                </figure>
              );
            case "list": {
              const Tag = b.style === "ordered" ? "ol" : "ul";
              return (
                <Tag key={i}>
                  {b.items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </Tag>
              );
            }
            case "steps":
              return (
                <ol className="steps" key={i}>
                  {b.items.map((x) => (
                    <li key={x.title}>
                      <h3>{x.title}</h3>
                      <p>{x.body}</p>
                    </li>
                  ))}
                </ol>
              );
            case "callout":
              return (
                <aside className={"callout " + b.tone} key={i}>
                  {b.label && <strong>{b.label}</strong>}
                  <p>{b.body}</p>
                </aside>
              );
            case "table":
              return (
                <div className="table-wrap" key={i}>
                  <table>
                    <thead>
                      <tr>
                        {b.columns.map((x) => (
                          <th key={x} scope="col">
                            {x}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b.rows.map((r, j) => (
                        <tr key={j}>
                          {r.map((x, k) => (
                            <td key={k}>{x}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            case "faq":
              return (
                <div className="faq" key={i}>
                  {b.items.map((x) => (
                    <div key={x.question}>
                      <h3>{x.question}</h3>
                      <p>{x.answer}</p>
                    </div>
                  ))}
                </div>
              );
            default:
              throw new Error("Unsupported public content block");
          }
        })}
    </>
  );
}
export function Chapter({
  id,
  title,
  blocks,
  index,
}: {
  id: string;
  title: string;
  blocks: Block[];
  index?: number;
}) {
  return (
    <section id={id} className="chapter">
      <h2>
        {index !== undefined && (
          <span className="chapter-index" aria-hidden="true">
            {String(index).padStart(2, "0")}
          </span>
        )}
        {title}
      </h2>
      <ContentBlocks blocks={blocks} />
    </section>
  );
}
