import type { App } from "@modelcontextprotocol/ext-apps";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";

const ANIMATION_CSS = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes drawLine {
    from { stroke-dashoffset: var(--len, 200); }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; animation-delay: 0ms !important; }
  }
  .fade-in { animation: fadeInUp 0.5s ease both; }
  .draw-line { animation: drawLine 0.8s ease both; stroke-dasharray: var(--len, 200); }
  .pulse { animation: pulse 2s ease infinite; }
`;

// ── Shared colours via CSS vars from host ────────────────────────────────────
const C = {
  fg: "var(--mcp-ui-foreground, #1a1a1a)",
  fgMuted: "var(--mcp-ui-muted-foreground, #6b7280)",
  bg: "var(--mcp-ui-background, #ffffff)",
  bgMuted: "var(--mcp-ui-muted, #f3f4f6)",
  border: "var(--mcp-ui-border, #e5e7eb)",
  primary: "var(--mcp-ui-primary, #3b82f6)",
  primaryFg: "var(--mcp-ui-primary-foreground, #ffffff)",
  accent: "var(--mcp-ui-accent, #8b5cf6)",
  green: "#22c55e",
  orange: "#f59e0b",
};

// ── Section 1: System Overview ────────────────────────────────────────────────

function SystemNode({
  x, y, width = 160, height = 80, label, sublabel, color, delay = 0,
}: {
  x: number; y: number; width?: number; height?: number;
  label: string; sublabel: string; color: string; delay?: number;
}) {
  return (
    <g className="fade-in" style={{ animationDelay: `${delay}ms` }}>
      <rect
        x={x} y={y} width={width} height={height} rx={10}
        fill={C.bgMuted} stroke={color} strokeWidth={2}
      />
      <rect x={x} y={y} width={width} height={28} rx={10} fill={color} />
      <rect x={x} y={y + 18} width={width} height={10} fill={color} />
      <text x={x + width / 2} y={y + 18} textAnchor="middle" fill={C.primaryFg}
        fontSize={12} fontWeight="600">
        {label}
      </text>
      <text x={x + width / 2} y={y + 48} textAnchor="middle" fill={C.fgMuted}
        fontSize={10} dominantBaseline="middle">
        {sublabel}
      </text>
    </g>
  );
}

function AnimatedArrow({
  x1, y1, x2, y2, label, delay = 0, bidirectional = false,
}: {
  x1: number; y1: number; x2: number; y2: number;
  label?: string; delay?: number; bidirectional?: boolean;
}) {
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g className="fade-in" style={{ animationDelay: `${delay}ms` }}>
      <defs>
        <marker id={`arr-${delay}`} markerWidth="8" markerHeight="8"
          refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={C.primary} />
        </marker>
        {bidirectional && (
          <marker id={`arr-back-${delay}`} markerWidth="8" markerHeight="8"
            refX="2" refY="3" orient="auto-start-reverse">
            <path d="M0,3 L8,0 L8,6 z" fill={C.primary} />
          </marker>
        )}
      </defs>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={C.primary} strokeWidth={2}
        markerEnd={`url(#arr-${delay})`}
        markerStart={bidirectional ? `url(#arr-back-${delay})` : undefined}
        className="draw-line"
        style={{ "--len": `${len}` } as React.CSSProperties}
        strokeDasharray={len}
        strokeDashoffset={len}
      />
      {label && (
        <text x={mx} y={my - 6} textAnchor="middle" fill={C.fgMuted} fontSize={9}>
          {label}
        </text>
      )}
    </g>
  );
}

function OverviewSection() {
  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: C.fg }}>
        System Overview
      </h2>
      <div className="rounded-xl border p-4" style={{ borderColor: C.border, background: C.bg }}>
        <svg viewBox="0 0 580 120" width="100%" aria-label="System overview diagram">
          <style>{ANIMATION_CSS}</style>

          <SystemNode x={10}  y={20} label="ask.archil.io" sublabel={"Web Lambda (SSR)\nStream Lambda"} color={C.primary} delay={0} />
          <SystemNode x={210} y={20} label="Claude AI" sublabel={"Haiku 4.5\nAnthropic API"} color={C.accent} delay={200} />
          <SystemNode x={410} y={20} label="mcp-ask-archil" sublabel={"Lambda (Node 24)\nTools + MCP Apps"} color={C.green} delay={400} />

          {/* ask.archil.io ↔ Claude */}
          <AnimatedArrow x1={170} y1={60} x2={210} y2={60} bidirectional delay={600} label="stream + tools" />
          {/* Claude ↔ MCP server */}
          <AnimatedArrow x1={370} y1={60} x2={410} y2={60} bidirectional delay={900} label="MCP protocol" />
        </svg>

        <div className="flex gap-6 mt-2 flex-wrap">
          {[
            { color: C.primary, label: "Homepage (ask.archil.io)" },
            { color: C.accent,  label: "Claude AI (Anthropic)" },
            { color: C.green,   label: "MCP Server (this server)" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: C.fgMuted }}>
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 2: Request Lifecycle ──────────────────────────────────────────────

const FLOW_STEPS = [
  { from: 0, to: 1, label: "1. POST /stream (JWT)",         delay: 0 },
  { from: 1, to: 2, label: "2. streamText() + tools",       delay: 300 },
  { from: 2, to: 1, label: "3. tool call → get-architecture", delay: 600 },
  { from: 1, to: 3, label: "4. callTool()",                 delay: 900 },
  { from: 3, to: 1, label: "5. result + resourceUri",       delay: 1200 },
  { from: 2, to: 1, label: "6. final text response",        delay: 1500 },
  { from: 1, to: 0, label: "7. SSE stream",                 delay: 1800 },
  { from: 0, to: 3, label: "8. fetch ui:// resource → iframe", delay: 2100 },
];

const LANES = ["Browser", "Stream Lambda", "Claude AI", "MCP Server"];
const LANE_COLORS = [C.primary, C.orange, C.accent, C.green];
const SW = 560;
const LANE_W = SW / LANES.length;
const LANE_X = (i: number) => LANE_W * i + LANE_W / 2;

function DataFlowSection() {
  const svgH = 60 + FLOW_STEPS.length * 38 + 20;
  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: C.fg }}>
        Request Lifecycle
      </h2>
      <div className="rounded-xl border p-4" style={{ borderColor: C.border, background: C.bg }}>
        <svg viewBox={`0 0 ${SW} ${svgH}`} width="100%" aria-label="Request lifecycle diagram">
          <style>{ANIMATION_CSS}</style>

          {/* Lane headers */}
          {LANES.map((name, i) => (
            <g key={name} className="fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <rect x={LANE_X(i) - 62} y={4} width={124} height={26} rx={6}
                fill={LANE_COLORS[i]} opacity={0.15} />
              <rect x={LANE_X(i) - 62} y={4} width={124} height={26} rx={6}
                fill="none" stroke={LANE_COLORS[i]} strokeWidth={1.5} />
              <text x={LANE_X(i)} y={17} textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fontWeight="600" fill={LANE_COLORS[i]}>
                {name}
              </text>
            </g>
          ))}

          {/* Vertical lane lines */}
          {LANES.map((name, i) => (
            <line key={`vl-${name}`} x1={LANE_X(i)} y1={34} x2={LANE_X(i)} y2={svgH - 10}
              stroke={LANE_COLORS[i]} strokeWidth={1} strokeDasharray="4 3" opacity={0.3}
              className="fade-in" style={{ animationDelay: `${400 + i * 50}ms` }} />
          ))}

          {/* Flow steps */}
          {FLOW_STEPS.map((step, idx) => {
            const y = 50 + idx * 38;
            const x1 = LANE_X(step.from);
            const x2 = LANE_X(step.to);
            const going_right = x2 > x1;
            const midX = (x1 + x2) / 2;
            const len = Math.abs(x2 - x1);
            const arrowId = `flow-arr-${idx}`;
            return (
              <g key={idx} className="fade-in"
                style={{ animationDelay: `${600 + step.delay}ms` }}>
                <defs>
                  <marker id={arrowId} markerWidth="7" markerHeight="7"
                    refX="6" refY="3.5" orient="auto">
                    <path d="M0,0 L0,7 L7,3.5 z"
                      fill={LANE_COLORS[step.to]} />
                  </marker>
                </defs>
                <line
                  x1={x1 + (going_right ? 8 : -8)} y1={y}
                  x2={x2 + (going_right ? -8 : 8)} y2={y}
                  stroke={LANE_COLORS[step.to]} strokeWidth={1.5}
                  markerEnd={`url(#${arrowId})`}
                  className="draw-line"
                  style={{ "--len": `${len - 16}` } as React.CSSProperties}
                  strokeDasharray={len - 16}
                  strokeDashoffset={len - 16}
                />
                <text x={midX} y={y - 5} textAnchor="middle"
                  fontSize={8.5} fill={C.fgMuted}>
                  {step.label}
                </text>
                {/* dots on lane */}
                <circle cx={x1} cy={y} r={3} fill={LANE_COLORS[step.from]} className="pulse"
                  style={{ animationDelay: `${600 + step.delay + 800}ms` }} />
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

// ── Section 3: MCP App Pipeline ───────────────────────────────────────────────

function McpAppsSection() {
  const boxes = [
    { label: "MCP Server", sub: "registerAppTool()\nregisterAppResource()", color: C.green },
    { label: "Stream Lambda", sub: "callTool()\nresources/read", color: C.orange },
    { label: "Browser", sub: "McpToolUI\nAppBridge + iframe", color: C.primary },
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

          {/* Arrow 0→1: tool result + resourceUri */}
          {[
            { label: "tool result + resourceUri →", delay: 600 },
            { label: "→ HTML (single-file)", delay: 900 },
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

// ── Tech Stack Chips ──────────────────────────────────────────────────────────

const TECH = [
  { label: "React 19",           color: C.primary },
  { label: "React Router 7",     color: C.primary },
  { label: "AWS Lambda",         color: C.orange },
  { label: "CloudFront + S3",    color: C.orange },
  { label: "Claude Haiku 4.5",   color: C.accent },
  { label: "Anthropic SDK",      color: C.accent },
  { label: "MCP SDK",            color: C.green },
  { label: "Tailwind CSS 4",     color: C.green },
  { label: "Vite",               color: C.fgMuted },
  { label: "TypeScript",         color: C.fgMuted },
  { label: "AWS CDK",            color: C.fgMuted },
];

function TechStack() {
  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: C.fg }}>
        Tech Stack
      </h2>
      <div className="flex flex-wrap gap-2">
        {TECH.map(({ label, color }, i) => (
          <span
            key={label}
            className="fade-in text-xs px-2.5 py-1 rounded-full border font-medium"
            style={{
              borderColor: color,
              color,
              background: C.bg,
              animationDelay: `${i * 60}ms`,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

// ── Inner viewer (renders after app connects) ─────────────────────────────────

function ArchitectureViewerInner({ app }: { app: App }) {
  useHostStyles(app, app.getHostContext());

  return (
    <main className="w-full overflow-y-auto p-4 space-y-6" style={{ background: C.bg }}>
      <div className="fade-in">
        <h1 className="text-lg font-bold" style={{ color: C.fg }}>How ask.archil.io Is Built</h1>
        <p className="text-sm mt-0.5" style={{ color: C.fgMuted }}>
          An AI-powered personal site with streaming Claude responses, MCP tools, and interactive app UIs.
        </p>
      </div>

      <OverviewSection />
      <DataFlowSection />
      <McpAppsSection />
      <TechStack />
    </main>
  );
}

// ── Root app shell ────────────────────────────────────────────────────────────

function ArchitectureApp() {
  const [isReady, setIsReady] = useState(false);

  const { app, error: connectionError } = useApp({
    appInfo: { name: "Architecture Viewer", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => ({});
      app.ontoolinput = async () => { setIsReady(false); };
      app.ontoolresult = async () => { setIsReady(true); };
      app.ontoolcancelled = () => { setIsReady(true); };
      app.onerror = () => { setIsReady(true); };
    },
  });

  useEffect(() => {
    if (app) setIsReady(true);
  }, [app]);

  if (connectionError) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-destructive text-sm">
          <strong>Connection Error:</strong> {connectionError.message}
        </p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-sm" style={{ color: C.fgMuted }}>Connecting…</p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-sm" style={{ color: C.fgMuted }}>Loading…</p>
      </div>
    );
  }

  return <ArchitectureViewerInner app={app} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ArchitectureApp />
  </StrictMode>,
);
