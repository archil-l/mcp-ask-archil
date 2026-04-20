import { C, ANIMATION_CSS } from "../shared/colors";

const FLOW_STEPS = [
  { from: 0, to: 1, label: "1. POST /stream (JWT)",             delay: 0 },
  { from: 1, to: 2, label: "2. streamText() + tools",           delay: 300 },
  { from: 2, to: 1, label: "3. tool call → get-architecture",   delay: 600 },
  { from: 1, to: 3, label: "4. callTool()",                     delay: 900 },
  { from: 3, to: 1, label: "5. result + resourceUri",           delay: 1200 },
  { from: 2, to: 1, label: "6. final text response",            delay: 1500 },
  { from: 1, to: 0, label: "7. SSE stream",                     delay: 1800 },
  { from: 0, to: 3, label: "8. fetch ui:// resource → iframe",  delay: 2100 },
];

const LANES = ["Browser", "Stream Lambda", "Claude AI", "MCP Server"];
const LANE_COLORS = [C.primary, C.orange, C.accent, C.green];
const SW = 560;
const LANE_W = SW / LANES.length;
const LANE_X = (i: number) => LANE_W * i + LANE_W / 2;

export function DataFlowSection() {
  const svgH = 60 + FLOW_STEPS.length * 38 + 20;
  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: C.fg }}>
        Request Lifecycle
      </h2>
      <div className="rounded-xl border p-4" style={{ borderColor: C.border, background: C.bg }}>
        <svg viewBox={`0 0 ${SW} ${svgH}`} width="100%" aria-label="Request lifecycle diagram">
          <style>{ANIMATION_CSS}</style>

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

          {LANES.map((name, i) => (
            <line key={`vl-${name}`} x1={LANE_X(i)} y1={34} x2={LANE_X(i)} y2={svgH - 10}
              stroke={LANE_COLORS[i]} strokeWidth={1} strokeDasharray="4 3" opacity={0.3}
              className="fade-in" style={{ animationDelay: `${400 + i * 50}ms` }} />
          ))}

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
                    <path d="M0,0 L0,7 L7,3.5 z" fill={LANE_COLORS[step.to]} />
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
