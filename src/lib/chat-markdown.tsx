import type { ReactNode } from "react";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-b-${index}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part ? <span key={`${keyPrefix}-t-${index}`}>{part}</span> : null;
  });
}

export function ChatMarkdown({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\n+/);

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n");
        const isList = lines.every(
          (line) => line.trim() === "" || /^[-*]\s+/.test(line.trim())
        );

        if (isList && lines.some((line) => /^[-*]\s+/.test(line.trim()))) {
          return (
            <ul
              key={`list-${blockIndex}`}
              className="list-disc space-y-1 pl-5"
            >
              {lines
                .filter((line) => /^[-*]\s+/.test(line.trim()))
                .map((line, lineIndex) => {
                  const text = line.replace(/^[-*]\s+/, "");
                  return (
                    <li key={`li-${blockIndex}-${lineIndex}`}>
                      {renderInline(text, `li-${blockIndex}-${lineIndex}`)}
                    </li>
                  );
                })}
            </ul>
          );
        }

        return (
          <p key={`p-${blockIndex}`}>
            {lines.map((line, lineIndex) => (
              <span key={`line-${blockIndex}-${lineIndex}`}>
                {lineIndex > 0 && <br />}
                {renderInline(line, `p-${blockIndex}-${lineIndex}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
