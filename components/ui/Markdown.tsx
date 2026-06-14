import React from "react";

// Minimal, dependency-free markdown renderer for blog + policy content.
// Supports: ## / ### headings, - and 1. lists, > blockquotes, --- rules,
// paragraphs, and inline **bold**, *italic*, `code`, and [links](url).

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] !== undefined) nodes.push(<strong key={`${keyBase}-${i}`} style={{ color: "var(--text)" }}>{m[2]}</strong>);
    else if (m[3] !== undefined) nodes.push(<em key={`${keyBase}-${i}`}>{m[3]}</em>);
    else if (m[4] !== undefined) nodes.push(<code key={`${keyBase}-${i}`} style={{ fontFamily: "var(--font-space-mono)", fontSize: ".9em" }}>{m[4]}</code>);
    else if (m[5] !== undefined && m[6] !== undefined) {
      const external = /^https?:\/\//.test(m[6]);
      nodes.push(
        <a key={`${keyBase}-${i}`} href={m[6]} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="underline underline-offset-2 transition-all hover:brightness-125 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:rounded-sm" style={{ color: "var(--accent)" }}>
          {m[5]}
        </a>
      );
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function Markdown({ content }: { content: string }) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-xl sm:text-2xl font-black mt-8 sm:mt-10 mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-anton)" }}>{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base sm:text-lg font-bold mt-6 mb-2" style={{ color: "var(--text)" }}>{line.slice(4)}</h3>);
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-2 pl-4 my-5 italic" style={{ borderColor: "var(--accent)", color: "var(--muted)" }}>
          {renderInline(line.slice(2), `bq-${i}`)}
        </blockquote>
      );
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) { items.push(lines[i].trim().slice(2)); i++; }
      elements.push(
        <ul key={i} className="list-disc list-outside space-y-1.5 text-[.97rem] mb-5 ml-5" style={{ color: "var(--muted)" }}>
          {items.map((it, j) => <li key={j}>{renderInline(it, `ul-${i}-${j}`)}</li>)}
        </ul>
      );
      continue;
    } else if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\. /)) { items.push(lines[i].trim().replace(/^\d+\. /, "")); i++; }
      elements.push(
        <ol key={i} className="list-decimal list-outside space-y-1.5 text-[.97rem] mb-5 ml-5" style={{ color: "var(--muted)" }}>
          {items.map((it, j) => <li key={j}>{renderInline(it, `ol-${i}-${j}`)}</li>)}
        </ol>
      );
      continue;
    } else if (line === "---") {
      elements.push(<hr key={i} className="my-8" style={{ borderColor: "var(--line)" }} />);
    } else if (line) {
      elements.push(<p key={i} className="text-[.97rem] leading-[1.75] mb-4" style={{ color: "var(--muted)" }}>{renderInline(line, `p-${i}`)}</p>);
    }
    i++;
  }

  return <>{elements}</>;
}
