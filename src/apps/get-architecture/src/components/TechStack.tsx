import { C, ANIMATION_CSS } from "../shared/colors";

const TECH = [
  { label: "React 19",        color: C.primary },
  { label: "React Router 7",  color: C.primary },
  { label: "AWS Lambda",      color: C.orange },
  { label: "CloudFront + S3", color: C.orange },
  { label: "Claude Haiku 4.5",color: C.accent },
  { label: "Anthropic SDK",   color: C.accent },
  { label: "MCP SDK",         color: C.green },
  { label: "Tailwind CSS 4",  color: C.green },
  { label: "Vite",            color: C.fgMuted },
  { label: "TypeScript",      color: C.fgMuted },
  { label: "AWS CDK",         color: C.fgMuted },
];

export function TechStack() {
  return (
    <section>
      <style>{ANIMATION_CSS}</style>
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
