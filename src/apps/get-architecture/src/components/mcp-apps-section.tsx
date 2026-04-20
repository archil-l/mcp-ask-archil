import { C, ANIMATION_CSS } from "../shared/colors";

export function McpAppsSection() {
  const boxes = [
    { label: "MCP Server",    sub: "registerAppTool()\nregisterAppResource()", color: C.green },
    { label: "Stream Lambda", sub: "callTool()\nresources/read",               color: C.orange },
    { label: "Browser",       sub: "McpToolUI\nAppBridge + iframe",            color: C.primary },
  ];
  const BW = 148;
  const BH = 72;
  const GAP = 56;
  const totalW = boxes.length * BW + (boxes.length - 1) * GAP;

  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: C.fg }}>
        MCP App Pipeline
      </h2>
      <div className="rounded-xl border p-4" style={{ borderColor: C.border, background: C.bg }}>
        <svg viewBox={`0 0 ${totalW + 40} ${BH + 60}`} width="100%" aria-label="MCP App pipeline">
          <style>{ANIMATION_CSS}</style>

          {boxes.map((b, i) => {
            const x = 20 + i * (BW + GAP);
            const y = 20;
            return (
              <g key={b.label} className="fade-in" style={{ animationDelay: `${i * 200}ms` }}>
                <rect x={x} y={y} width={BW} height={BH} rx={8}
                  fill={C.bgMuted} stroke={b.color} strokeWidth={2} />
                <rect x={x} y={y} width={BW} height={24} rx={8} fill={b.color} />
                <rect x={x} y={y + 14} width={BW} height={10} fill={b.color} />
                <text x={x + BW / 2} y={y + 14} textAnchor="middle"
                  fill={C.primaryFg} fontSize={11} fontWeight="600">
                  {b.label}
                </text>
                {b.sub.split("\n").map((line, li) => (
                  <text key={li} x={x + BW / 2} y={y + 36 + li * 14}
                    textAnchor="middle" fill={C.fgMuted} fontSize={9}>
                    {line}
                  </text>
                ))}
              </g>
            );
          })}

          {[
            { label: "tool result + resourceUri →", delay: 600 },
            { label: "→ HTML (single-file)",        delay: 900 },
          ].map((arrow, i) => {
            const fromX = 20 + i * (BW + GAP) + BW;
            const toX = fromX + GAP;
            const y = 20 + BH / 2;
            const len = GAP - 8;
            const arrowId = `mcp-arr-${i}`;
            return (
              <g key={i} className="fade-in" style={{ animationDelay: `${arrow.delay}ms` }}>
                <defs>
                  <marker id={arrowId} markerWidth="7" markerHeight="7"
                    refX="6" refY="3.5" orient="auto">
                    <path d="M0,0 L0,7 L7,3.5 z" fill={C.primary} />
                  </marker>
                </defs>
                <line x1={fromX + 4} y1={y} x2={toX - 4} y2={y}
                  stroke={C.primary} strokeWidth={1.5}
                  markerEnd={`url(#${arrowId})`}
                  className="draw-line"
                  style={{ "--len": `${len}` } as React.CSSProperties}
                  strokeDasharray={len} strokeDashoffset={len} />
                <text x={(fromX + toX) / 2} y={y - 6}
                  textAnchor="middle" fontSize={8} fill={C.fgMuted}>
                  {arrow.label}
                </text>
              </g>
            );
          })}
        </svg>

        <p className="text-xs mt-2" style={{ color: C.fgMuted }}>
          Each MCP App is a self-contained single-file HTML bundle (React + Tailwind, compiled by Vite).
          The host renders it in a sandboxed iframe connected via AppBridge / PostMessageTransport.
        </p>
      </div>
    </section>
  );
}
