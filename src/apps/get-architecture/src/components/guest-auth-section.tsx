import { C, ANIMATION_CSS } from "../shared/colors";
import { IconBrowser, IconLambda, IconSecretsManager } from "../shared/icons";

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

export function GuestAuthSection() {
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

          <IconBrowser        x={JLX(0)} y={47} size={20} />
          <IconLambda         x={JLX(1)} y={47} size={20} />
          <IconSecretsManager x={JLX(2)} y={47} size={20} />
          <IconLambda         x={JLX(3)} y={47} size={20} />

          {JWT_LANES.map((name, i) => (
            <line key={`jl-${name}`} x1={JLX(i)} y1={60} x2={JLX(i)} y2={svgH - 10}
              stroke={JWT_COLORS[i]} strokeWidth={1} strokeDasharray="4 3" opacity={0.3}
              className="fade-in" style={{ animationDelay: `${350 + i * 50}ms` }} />
          ))}

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
                  x2={x2 + (goRight ? -8 : 8)} y2={y}
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
