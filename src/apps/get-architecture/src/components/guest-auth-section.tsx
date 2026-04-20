import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";
import { C } from "../shared/colors";

const DIAGRAM = `
sequenceDiagram
  autonumber
  participant B as Browser
  participant WL as Web Lambda
  participant SM as Secrets Manager
  box
    participant SL as Stream Lambda
  end

  B->>WL: GET /api/jwt-token
  WL->>SM: GetSecretValue (JWT_SECRET_ARN)
  SM->>WL: 32-byte signing secret
  WL->>B: { token, expiresIn } HS256 / 1 hr
  B->>SL: POST /stream  Authorization: Bearer …
  SL->>B: verify sig + expiry → allow
  Note over B,WL: auto-refresh when < 5 min remain
`;

let idCounter = 0;

export function GuestAuthSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    const id = `mermaid-auth-${idCounter++}`;
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
      <h2 className="text-base font-semibold mb-1" style={{ color: C.fg }}>
        Authentication via JWT tokens
      </h2>
      <p className="text-sm mb-3" style={{ color: C.fgMuted }}>
        No login required — every visitor gets a short-lived signed token, so the streaming endpoint
        stays protected without accounts.
      </p>
      <div className="rounded-xl border p-6" style={{ borderColor: C.border, background: C.bgCanvas }}>
        {svg
          ? <div ref={ref} dangerouslySetInnerHTML={{ __html: svg }} />
          : <p ref={ref} style={{ color: C.fgMuted, fontSize: 12, textAlign: "center" }}>Rendering diagram…</p>
        }
      </div>
    </section>
  );
}
