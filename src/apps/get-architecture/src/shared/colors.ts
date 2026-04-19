export const C = {
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

export const ANIMATION_CSS = `
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
