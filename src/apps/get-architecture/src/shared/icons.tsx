import { C } from "./colors";

export function IconLambda({ x, y, size = 32 }: { x: number; y: number; size?: number }) {
  const s = size / 32;
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${s})`}>
      <rect width={32} height={32} rx={6} fill="#E8741A" />
      <text x={16} y={23} textAnchor="middle" fill="white" fontSize={18} fontWeight="700" fontFamily="monospace">λ</text>
    </g>
  );
}

export function IconCloudFront({ x, y, size = 28 }: { x: number; y: number; size?: number }) {
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

export function IconS3({ x, y, size = 28 }: { x: number; y: number; size?: number }) {
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

export function IconClaude({ x, y, size = 32 }: { x: number; y: number; size?: number }) {
  const s = size / 32;
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${s})`}>
      <rect width={32} height={32} rx={6} fill="#CC785C" />
      <text x={16} y={23} textAnchor="middle" fill="white" fontSize={16} fontWeight="700">A</text>
    </g>
  );
}

export function IconAPIGW({ x, y, size = 28 }: { x: number; y: number; size?: number }) {
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

export function IconBrowser({ x, y, size = 28 }: { x: number; y: number; size?: number }) {
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

export function IconSecretsManager({ x, y, size = 28 }: { x: number; y: number; size?: number }) {
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
