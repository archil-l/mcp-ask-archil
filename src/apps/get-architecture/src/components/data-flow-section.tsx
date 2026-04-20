import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";
import { C } from "../shared/colors";

const DIAGRAM = `
sequenceDiagram
  autonumber
  participant B as Browser
  participant SL as Stream Lambda
  participant AI as Claude AI
  box
    participant MCP as MCP Server
  end

  B->>SL: POST /stream (JWT)
  SL->>AI: streamText() + tools
  AI->>SL: tool call → get-architecture
  SL->>MCP: callTool()
  MCP->>SL: result + resourceUri
  AI->>SL: final text response
  SL->>B: SSE stream
  B->>MCP: fetch ui:// resource → iframe
`;

let idCounter = 0;

export function DataFlowSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    const id = `mermaid-seq-${idCounter++}`;
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        primaryTextColor: "#1f2937",
        lineColor: "#374151",
        textColor: "#1f2937",
        signalColor: "#374151",
        signalTextColor: "#1f2937",
        actorTextColor: "#1f2937",
        actorLineColor: "#374151",
        actorBorder: "#6b7280",
        actorBackground: "#f3f4f6",
        noteBkgColor: "#f3f4f6",
        noteTextColor: "#1f2937",
        noteBorderColor: "#6b7280",
        labelTextColor: "#1f2937",
        loopTextColor: "#1f2937",
        sequenceNumberColor: "#ffffff",
        labelBoxBkgColor: "#e5e7eb",
        labelBoxBorderColor: "#6b7280",
      },
      sequence: {
        actorMargin: 80,
        messageMargin: 20,
        boxMargin: 10,
        mirrorActors: false,
      },
    });

    mermaid.render(id, DIAGRAM).then(({ svg: rendered }) => {
      const clean = rendered
        .replace(/width="[^"]*"/, 'width="100%"')
        .replace(/height="[^"]*"/, "")
        // sequence number circles: make background dark, text white
        .replace(
          /(<circle[^>]*class="[^"]*sequenceNumber[^"]*"[^>]*)(fill="[^"]*")/g,
          '$1fill="#374151"',
        )
        .replace(
          /(<text[^>]*class="[^"]*sequenceNumber[^"]*"[^>]*)(fill="[^"]*")/g,
          '$1fill="#ffffff"',
        );
      setSvg(clean);
    });
  }, []);

  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: C.fg }}>
        Request Lifecycle
      </h2>
      <div className="rounded-xl border p-6" style={{ borderColor: C.border, background: C.bgCanvas }}>
        {svg
          ? <div ref={ref} dangerouslySetInnerHTML={{ __html: svg }} />
          : <p ref={ref} style={{ color: C.fgMuted, fontSize: 12, textAlign: "center" }}>Rendering diagram…</p>
        }
      </div>
    </section>
  );
}
