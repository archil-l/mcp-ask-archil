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

// ── AWS-style SVG icons ───────────────────────────────────────────────────────

// Lambda icon (AWS orange λ shape)
function IconLambda({ x, y, size = 32 }: { x: number; y: number; size?: number }) {
  const s = size / 32;
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${s})`}>
      <rect width={32} height={32} rx={6} fill="#E8741A" />
      <text x={16} y={23} textAnchor="middle" fill="white" fontSize={18} fontWeight="700" fontFamily="monospace">λ</text>
    </g>
  );
}

// CloudFront icon (globe-like)
function IconCloudFront({ x, y, size = 28 }: { x: number; y: number; size?: number }) {
  const s = size / 28;
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${s})`}>
      <rect width={28} height={28} rx={6} fill="#8C4FFF" />
      <ellipse cx={14} cy={14} rx={9} ry={9} fill="none" stroke="white" strokeWidth={1.5} />
      <ellipse cx={14} cy={14} rx={4} ry={9} fill="none" stroke="white" strokeWidth={1} />
      <line x1={5} y1={14} x2={23} y2={14} stroke="white" strokeWidth={1} />
    </g>
  );
}

// S3 icon (bucket shape)
function IconS3({ x, y, size = 28 }: { x: number; y: number; size?: number }) {
  const s = size / 28;
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${s})`}>
      <rect width={28} height={28} rx={6} fill="#3F8624" />
      <ellipse cx={14} cy={10} rx={8} ry={3.5} fill="white" opacity={0.9} />
      <rect x={6} y={10} width={16} height={9} fill="white" opacity={0.7} />
      <ellipse cx={14} cy={19} rx={8} ry={3.5} fill="white" opacity={0.9} />
    </g>
  );
}

// Anthropic/Claude icon (A shape)
function IconClaude({ x, y, size = 32 }: { x: number; y: number; size?: number }) {
  const s = size / 32;
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${s})`}>
      <rect width={32} height={32} rx={6} fill="#CC785C" />
      <text x={16} y={23} textAnchor="middle" fill="white" fontSize={16} fontWeight="700">A</text>
    </g>
  );
}

// API Gateway icon
function IconAPIGW({ x, y, size = 28 }: { x: number; y: number; size?: number }) {
  const s = size / 28;
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${s})`}>
      <rect width={28} height={28} rx={6} fill="#E8741A" />
      <line x1={5} y1={9}  x2={23} y2={9}  stroke="white" strokeWidth={2} strokeLinecap="round" />
      <line x1={5} y1={14} x2={23} y2={14} stroke="white" strokeWidth={2} strokeLinecap="round" />
      <line x1={5} y1={19} x2={23} y2={19} stroke="white" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

// Browser icon
function IconBrowser({ x, y, size = 28 }: { x: number; y: number; size?: number }) {
  const s = size / 28;
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${s})`}>
      <rect width={28} height={28} rx={6} fill={C.primary} />
      <rect x={3} y={3} width={22} height={22} rx={3} fill="none" stroke="white" strokeWidth={1.5} />
      <line x1={3} y1={9} x2={25} y2={9} stroke="white" strokeWidth={1.5} />
      <circle cx={7} cy={6} r={1.2} fill="white" />
      <circle cx={11} cy={6} r={1.2} fill="white" />
    </g>
  );
}

// ── Section 1: AWS Infrastructure Overview ────────────────────────────────────

// Reusable connection arrow matching the style in DataFlowSection / McpAppsSection
function InfraArrow({
  x1, y1, x2, y2, label, delay = 0, id,
}: {
  x1: number; y1: number; x2: number; y2: number;
  label?: string; delay?: number; id: string;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  // Shrink both ends by 8px so arrow doesn't overlap the node
  const ux = dx / len;
  const uy = dy / len;
  const sx = x1 + ux * 8;
  const sy = y1 + uy * 8;
  const ex = x2 - ux * 8;
  const ey = y2 - uy * 8;
  const drawLen = len - 16;
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  return (
    <g className="fade-in" style={{ animationDelay: `${delay}ms` }}>
      <defs>
        <marker id={id} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L0,7 L7,3.5 z" fill={C.primary} />
        </marker>
        <marker id={`${id}-back`} markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto-start-reverse">
          <path d="M0,0 L0,7 L7,3.5 z" fill={C.primary} />
        </marker>
      </defs>
      <line
        x1={sx} y1={sy} x2={ex} y2={ey}
        stroke={C.primary} strokeWidth={1.5}
        markerEnd={`url(#${id})`}
        markerStart={`url(#${id}-back)`}
        className="draw-line"
        style={{ "--len": `${drawLen}` } as React.CSSProperties}
        strokeDasharray={drawLen}
        strokeDashoffset={drawLen}
      />
      {label && (
        <text x={mx} y={my - 6} textAnchor="middle" fill={C.fgMuted} fontSize={8.5}>
          {label}
        </text>
      )}
    </g>
  );
}

// AWS-style grouped service box
function AwsGroup({
  x, y, width, height, label, color, delay = 0, children,
}: {
  x: number; y: number; width: number; height: number;
  label: string; color: string; delay?: number;
  children?: React.ReactNode;
}) {
  return (
    <g className="fade-in" style={{ animationDelay: `${delay}ms` }}>
      <rect x={x} y={y} width={width} height={height} rx={8}
        fill={C.bgMuted} stroke={color} strokeWidth={1.5} strokeDasharray="5 3" />
      <rect x={x + 8} y={y - 9} width={width - 16} height={16} rx={4} fill={C.bg} />
      <text x={x + width / 2} y={y - 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={9} fontWeight="700" fill={color}>
        {label}
      </text>
      {children}
    </g>
  );
}

// Single service tile inside a group
function ServiceTile({
  x, y, label, Icon,
}: {
  x: number; y: number; label: string;
  Icon: React.ComponentType<{ x: number; y: number; size?: number }>;
}) {
  return (
    <g>
      <Icon x={x} y={y} size={28} />
      <text x={x} y={y + 20} textAnchor="middle" fill={C.fgMuted} fontSize={8}>
        {label}
      </text>
    </g>
  );
}

function OverviewSection() {
  // Layout constants
  const W = 580;
  const H = 210;

  // Group bounds
  const homepageX = 12;  const homepageW = 180;
  const claudeX   = 220; const claudeW   = 140;
  const mcpX      = 390; const mcpW      = 180;
  const groupY    = 24;  const groupH    = 150;

  // Arrow y-midpoints for the groups
  const arrowY = groupY + groupH / 2 + 10;

  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: C.fg }}>
        AWS Infrastructure
      </h2>
      <div className="rounded-xl border p-4" style={{ borderColor: C.border, background: C.bg }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-label="AWS infrastructure diagram">
          <style>{ANIMATION_CSS}</style>
          <defs>
            {/* AWS orange gradient for region border */}
            <linearGradient id="aws-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E8741A" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#E8741A" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          {/* AWS Region background */}
          <rect x={2} y={14} width={W - 4} height={H - 20} rx={10}
            fill="url(#aws-grad)" stroke="#E8741A" strokeWidth={1} strokeDasharray="6 3"
            className="fade-in" style={{ animationDelay: "0ms" }} />
          <text x={12} y={12} fontSize={8} fill="#E8741A" fontWeight="600"
            className="fade-in" style={{ animationDelay: "0ms" }}>
            AWS us-east-1
          </text>

          {/* ── ask.archil.io group ── */}
          <AwsGroup x={homepageX} y={groupY} width={homepageW} height={groupH}
            label="ask.archil.io" color={C.primary} delay={100}>
            {/* CloudFront */}
            <ServiceTile x={homepageX + 30} y={groupY + 44} label="CloudFront" Icon={IconCloudFront} />
            {/* Web Lambda */}
            <ServiceTile x={homepageX + 78} y={groupY + 44} label="Web Lambda" Icon={IconLambda} />
            {/* Stream Lambda */}
            <ServiceTile x={homepageX + 126} y={groupY + 44} label="Stream λ" Icon={IconLambda} />
            {/* Browser above group */}
            <ServiceTile x={homepageX + 78} y={groupY + 108} label="S3 Assets" Icon={IconS3} />
          </AwsGroup>

          {/* ── Claude AI / Anthropic ── */}
          <AwsGroup x={claudeX} y={groupY} width={claudeW} height={groupH}
            label="Anthropic API" color={C.accent} delay={250}>
            <ServiceTile x={claudeX + claudeW / 2} y={groupY + 68} label="Claude Haiku 4.5" Icon={IconClaude} />
          </AwsGroup>

          {/* ── mcp-ask-archil group ── */}
          <AwsGroup x={mcpX} y={groupY} width={mcpW} height={groupH}
            label="mcp-ask-archil" color={C.green} delay={400}>
            <ServiceTile x={mcpX + 36}  y={groupY + 44} label="API Gateway" Icon={IconAPIGW} />
            <ServiceTile x={mcpX + 90}  y={groupY + 44} label="MCP Lambda" Icon={IconLambda} />
            <ServiceTile x={mcpX + 144} y={groupY + 44} label="S3 (PDF)" Icon={IconS3} />
          </AwsGroup>

          {/* ── Arrows ── */}
          {/* Stream Lambda ↔ Claude */}
          <InfraArrow
            x1={homepageX + homepageW} y1={arrowY}
            x2={claudeX}              y2={arrowY}
            label="SSE stream / tool calls"
            delay={650} id="ov-arr-0"
          />
          {/* Claude ↔ MCP server */}
          <InfraArrow
            x1={claudeX + claudeW} y1={arrowY}
            x2={mcpX}              y2={arrowY}
            label="MCP protocol"
            delay={900} id="ov-arr-1"
          />
        </svg>
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

// ── Section 3: Guest Auth (JWT) ───────────────────────────────────────────────

// Secrets Manager icon
function IconSecretsManager({ x, y, size = 28 }: { x: number; y: number; size?: number }) {
  const s = size / 28;
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${s})`}>
      <rect width={28} height={28} rx={6} fill="#DD344C" />
      <rect x={9} y={6} width={10} height={8} rx={2} fill="none" stroke="white" strokeWidth={1.5} />
      <rect x={6} y={12} width={16} height={11} rx={2} fill="none" stroke="white" strokeWidth={1.5} />
      <circle cx={14} cy={17} r={2} fill="white" />
      <line x1={14} y1={19} x2={14} y2={22} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
}

const JWT_LANES = ["Browser", "Web Lambda", "Secrets Manager", "Stream Lambda"];
const JWT_COLORS = [C.primary, C.orange, "#DD344C", C.accent];
const JWT_STEPS = [
  { from: 0, to: 1, label: "1. GET /api/jwt-token",                    delay: 0 },
  { from: 1, to: 2, label: "2. GetSecretValue (JWT_SECRET_ARN)",       delay: 300 },
  { from: 2, to: 1, label: "3. 32-byte signing secret",                delay: 600 },
  { from: 1, to: 0, label: "4. { token, expiresIn } HS256 / 1 hr",    delay: 900 },
  { from: 0, to: 3, label: "5. POST /stream  Authorization: Bearer …", delay: 1300 },
  { from: 3, to: 0, label: "6. verify sig + expiry → allow",           delay: 1600 },
  { from: 0, to: 1, label: "7. auto-refresh when < 5 min remain",      delay: 2000 },
];

const JW = 560;
const JLW = JW / JWT_LANES.length;
const JLX = (i: number) => JLW * i + JLW / 2;

function GuestAuthSection() {
  const svgH = 60 + JWT_STEPS.length * 40 + 20;
  return (
    <section>
      <h2 className="text-base font-semibold mb-1" style={{ color: C.fg }}>
        Guest Authentication (JWT)
      </h2>
      <p className="text-xs mb-3" style={{ color: C.fgMuted }}>
        No login required — every visitor gets a short-lived signed token, so the streaming endpoint
        stays protected without accounts.
      </p>
      <div className="rounded-xl border p-4" style={{ borderColor: C.border, background: C.bg }}>
        <svg viewBox={`0 0 ${JW} ${svgH}`} width="100%" aria-label="JWT guest auth diagram">
          <style>{ANIMATION_CSS}</style>

          {/* Lane headers */}
          {JWT_LANES.map((name, i) => (
            <g key={name} className="fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <rect x={JLX(i) - 62} y={4} width={124} height={26} rx={6}
                fill={JWT_COLORS[i]} opacity={0.12} />
              <rect x={JLX(i) - 62} y={4} width={124} height={26} rx={6}
                fill="none" stroke={JWT_COLORS[i]} strokeWidth={1.5} />
              <text x={JLX(i)} y={17} textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fontWeight="600" fill={JWT_COLORS[i]}>
                {name}
              </text>
            </g>
          ))}

          {/* Icons under headers */}
          <IconBrowser         x={JLX(0)} y={47} size={20} />
          <IconLambda          x={JLX(1)} y={47} size={20} />
          <IconSecretsManager  x={JLX(2)} y={47} size={20} />
          <IconLambda          x={JLX(3)} y={47} size={20} />

          {/* Vertical lane lines */}
          {JWT_LANES.map((name, i) => (
            <line key={`jl-${name}`} x1={JLX(i)} y1={60} x2={JLX(i)} y2={svgH - 10}
              stroke={JWT_COLORS[i]} strokeWidth={1} strokeDasharray="4 3" opacity={0.3}
              className="fade-in" style={{ animationDelay: `${350 + i * 50}ms` }} />
          ))}

          {/* Separator before auto-refresh step */}
          <line x1={20} y1={60 + 3 * 40 + 20 + 1} x2={JW - 20} y2={60 + 3 * 40 + 20 + 1}
            stroke={C.border} strokeWidth={1} strokeDasharray="3 3"
            className="fade-in" style={{ animationDelay: "1100ms" }} />
          <text x={JW / 2} y={60 + 3 * 40 + 12} textAnchor="middle"
            fontSize={7.5} fill={C.fgMuted} fontStyle="italic"
            className="fade-in" style={{ animationDelay: "1100ms" }}>
            on every chat message
          </text>
          <text x={JW / 2} y={60 + 5 * 40 + 36} textAnchor="middle"
            fontSize={7.5} fill={C.fgMuted} fontStyle="italic"
            className="fade-in" style={{ animationDelay: "1900ms" }}>
            silently, when &lt; 5 min remain
          </text>

          {/* Flow steps */}
          {JWT_STEPS.map((step, idx) => {
            const y = 72 + idx * 40;
            const x1 = JLX(step.from);
            const x2 = JLX(step.to);
            const goRight = x2 > x1;
            const midX = (x1 + x2) / 2;
            const len = Math.abs(x2 - x1);
            const arrowId = `jwt-arr-${idx}`;
            const strokeColor = JWT_COLORS[step.to];
            return (
              <g key={idx} className="fade-in"
                style={{ animationDelay: `${550 + step.delay}ms` }}>
                <defs>
                  <marker id={arrowId} markerWidth="7" markerHeight="7"
                    refX="6" refY="3.5" orient="auto">
                    <path d="M0,0 L0,7 L7,3.5 z" fill={strokeColor} />
                  </marker>
                </defs>
                <line
                  x1={x1 + (goRight ? 8 : -8)} y1={y}
                  x2={x2 + (goRight ? -8 :  8)} y2={y}
                  stroke={strokeColor} strokeWidth={1.5}
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
                <circle cx={x1} cy={y} r={3} fill={JWT_COLORS[step.from]} className="pulse"
                  style={{ animationDelay: `${550 + step.delay + 700}ms` }} />
              </g>
            );
          })}
        </svg>

        {/* Key facts callout */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { icon: "🔑", label: "HS256 signed",   desc: "32-byte secret from Secrets Manager" },
            { icon: "⏱",  label: "1 hr expiry",    desc: "Auto-refreshed when < 5 min remain" },
            { icon: "🚫", label: "No accounts",    desc: "Token sub is 'app' — no user identity" },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="rounded-lg p-2.5 text-center"
              style={{ background: C.bgMuted, border: `1px solid ${C.border}` }}>
              <div className="text-lg">{icon}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: C.fg }}>{label}</div>
              <div className="text-xs mt-0.5" style={{ color: C.fgMuted }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 4: MCP App Pipeline ───────────────────────────────────────────────

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
      <div className="fade-in space-y-3">
        <h1 className="text-lg font-bold" style={{ color: C.fg }}>How ask.archil.io Is Built</h1>
        <p className="text-sm leading-relaxed" style={{ color: C.fgMuted }}>
          ask.archil.io is Archil's personal website — a chat interface where visitors can ask
          anything about his work, experience, or background. Instead of a static page, every
          response comes from a real{" "}
          <span style={{ color: C.accent, fontWeight: 600 }}>Claude Haiku 4.5</span> instance that
          streams answers in real time and uses tools to do things dynamically: display his resume,
          toggle the page theme, or render interactive diagrams like this one.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: C.fgMuted }}>
          Under the hood, two serverless{" "}
          <span style={{ color: C.orange, fontWeight: 600 }}>AWS Lambda</span> functions power the
          site — one for SSR and APIs, one dedicated to LLM streaming. A separate{" "}
          <span style={{ color: C.green, fontWeight: 600 }}>MCP server</span> (also a Lambda) gives
          Claude its extended capabilities via the Model Context Protocol. Guests get a short-lived{" "}
          <span style={{ color: C.primary, fontWeight: 600 }}>JWT</span> automatically on page load
          so the stream endpoint stays protected without any login.
        </p>
        <div className="flex gap-3 pt-1">
          {[
            { href: "https://github.com/archil-l/ask-archil-io", label: "ask-archil-io" },
            { href: "https://github.com/archil-l/mcp-ask-archil", label: "mcp-ask-archil" },
          ].map(({ href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-opacity hover:opacity-70"
              style={{ borderColor: C.border, color: C.fg, background: C.bgMuted, textDecoration: "none" }}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {label}
            </a>
          ))}
        </div>
      </div>

      <OverviewSection />
      <DataFlowSection />
      <GuestAuthSection />
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
