import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Panel,
  Position,
  useNodesState,
  useEdgesState,
  type Edge,
  type NodeTypes,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useState } from "react";
import { C } from "../shared/colors";

import lambdaSvg   from "../resources/architecture-service-icons/Arch_Compute/64/Arch_AWS-Lambda_64.svg";
import claudeSvg   from "../resources/claude-logo.svg";
import mcpSvg      from "../resources/mcp.svg";

// ── Shared handle style ───────────────────────────────────────────────────────

const hs = { width: 8, height: 8, background: C.accent, opacity: 0, transition: "opacity 0.15s" };
const sideHandle = { ...hs, top: "50%" };

// ── Browser node ──────────────────────────────────────────────────────────────

type BrowserNodeData = { label: string };

function BrowserIcon({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 72 72" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="72" rx="14" fill="#3b82f620" />
      <circle cx="36" cy="36" r="20" stroke="#3b82f6" strokeWidth="2" />
      <ellipse cx="36" cy="36" rx="8" ry="20" stroke="#3b82f6" strokeWidth="2" />
      <line x1="16" y1="36" x2="56" y2="36" stroke="#3b82f6" strokeWidth="2" />
      <line x1="18" y1="27" x2="54" y2="27" stroke="#3b82f6" strokeWidth="2" />
      <line x1="18" y1="45" x2="54" y2="45" stroke="#3b82f6" strokeWidth="2" />
    </svg>
  );
}

function BrowserNode({ data }: { data: BrowserNodeData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Handle id="top"    type="target" position={Position.Top}    style={hs} />
      <Handle id="left"   type="target" position={Position.Left}   style={sideHandle} />
      <BrowserIcon size={52} />
      <span style={{ fontSize: 11, fontWeight: 600, color: C.fg, textAlign: "center" }}>
        {data.label}
      </span>
      <Handle id="right"     type="source" position={Position.Right}  style={{ ...sideHandle, marginTop: -4 }} />
      <Handle id="right-tgt" type="target" position={Position.Right}  style={{ ...sideHandle, marginTop:  4 }} />
      <Handle id="bottom"    type="source" position={Position.Bottom} style={hs} />
    </div>
  );
}

// ── Description node (dashed chip below browser) ──────────────────────────────

type DescNodeData = { lines: string[] };

function DescNode({ data }: { data: DescNodeData }) {
  return (
    <div style={{
      border: `1.5px dashed ${C.primary}`,
      borderRadius: 8,
      padding: "6px 10px",
      background: `${C.primary}0d`,
      display: "flex",
      flexDirection: "column",
      gap: 3,
      minWidth: 160,
    }}>
      <Handle id="top"  type="target" position={Position.Top}  style={hs} />
      <Handle id="left" type="target" position={Position.Left} style={sideHandle} />
      {data.lines.map((line, i) => (
        <span key={i} style={{ fontSize: 9, color: C.primary, whiteSpace: "nowrap", fontFamily: "monospace" }}>
          {line}
        </span>
      ))}
    </div>
  );
}

// ── Icon service node (lambda, claude, mcp) ───────────────────────────────────

type ServiceNodeData = {
  label: string;
  sublabel?: string;
  icon: "lambda" | "claude" | "mcp";
};

const ICON_SIZE = 48;

function ServiceIcon({ icon }: { icon: ServiceNodeData["icon"] }) {
  if (icon === "lambda") {
    return <img src={lambdaSvg} alt="" width={ICON_SIZE} height={ICON_SIZE} style={{ display: "block" }} />;
  }
  if (icon === "claude") {
    return <img src={claudeSvg} alt="" width={ICON_SIZE} height={ICON_SIZE} style={{ display: "block" }} />;
  }
  // mcp — inline SVG so we can color it
  return (
    <div style={{
      width: ICON_SIZE, height: ICON_SIZE,
      borderRadius: 10,
      background: "#00000010",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <img src={mcpSvg} alt="" width={ICON_SIZE * 0.6} height={ICON_SIZE * 0.6} style={{ display: "block" }} />
    </div>
  );
}

function ServiceNode({ data }: { data: ServiceNodeData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Handle id="top"        type="target" position={Position.Top}    style={hs} />
      <Handle id="left"       type="target" position={Position.Left}   style={{ ...sideHandle, marginTop: -4 }} />
      <Handle id="left-src"   type="source" position={Position.Left}   style={{ ...sideHandle, marginTop:  4 }} />
      <ServiceIcon icon={data.icon} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.fg, textAlign: "center", maxWidth: 100 }}>
          {data.label}
        </span>
        {data.sublabel && (
          <span style={{ fontSize: 9, color: C.fgMuted, textAlign: "center", fontFamily: "monospace" }}>
            {data.sublabel}
          </span>
        )}
      </div>
      <Handle id="right"      type="source" position={Position.Right}  style={{ ...sideHandle, marginTop: -4 }} />
      <Handle id="right-tgt"  type="target" position={Position.Right}  style={{ ...sideHandle, marginTop:  4 }} />
      <Handle id="bottom"     type="source" position={Position.Bottom} style={hs} />
    </div>
  );
}

// ── Node types ────────────────────────────────────────────────────────────────

const nodeTypes: NodeTypes = {
  browser: BrowserNode as unknown as NodeTypes[string],
  desc:    DescNode    as unknown as NodeTypes[string],
  service: ServiceNode as unknown as NodeTypes[string],
};

// ── Layout ────────────────────────────────────────────────────────────────────
//
//   Browser ──→ Streaming Lambda ──→ Claude ──→ MCP Server
//      │                                           ↑
//      └──────→ MCP Proxy Lambda ─────────────────┘
//   [desc]

const INITIAL_NODES: Node[] = [
  {
    id: "browser", type: "browser",
    position: { x: 40, y: 100 },
    data: { label: "Browser" } as BrowserNodeData,
  },
  {
    id: "browser-desc", type: "desc",
    position: { x: 0, y: 240 },
    data: { lines: ["McpToolUI", "→ AppBridge", "→ iframe", "→ MCP Tool/Resource"] } as DescNodeData,
  },
  {
    id: "stream-lambda", type: "service",
    position: { x: 220, y: 30 },
    data: { label: "Streaming Lambda", sublabel: "callTool()", icon: "lambda" } as ServiceNodeData,
  },
  {
    id: "mcp-proxy", type: "service",
    position: { x: 220, y: 200 },
    data: { label: "MCP Proxy Lambda", sublabel: "fetch UI resource", icon: "lambda" } as ServiceNodeData,
  },
  {
    id: "claude", type: "service",
    position: { x: 430, y: 30 },
    data: { label: "Claude", icon: "claude" } as ServiceNodeData,
  },
  {
    id: "mcp-server", type: "service",
    position: { x: 620, y: 110 },
    data: { label: "MCP Server", icon: "mcp" } as ServiceNodeData,
  },
];

const edgeBase = { labelStyle: { fontSize: 9 } };

const INITIAL_EDGES: Edge[] = [
  // Browser → desc (vertical, dashed, no arrow)
  {
    id: "e-browser-desc",
    source: "browser", sourceHandle: "bottom",
    target: "browser-desc", targetHandle: "top",
    style: { stroke: C.primary, strokeDasharray: "4 3" },
    animated: false,
    ...edgeBase,
  },
  // Browser → Streaming Lambda
  {
    id: "e-browser-sl",
    source: "browser", sourceHandle: "right",
    target: "stream-lambda", targetHandle: "left",
    label: "SSE /stream",
    animated: true,
    style: { stroke: "#3b82f6" },
    ...edgeBase,
  },
  // MCP Proxy Lambda → Browser (response: HTML bundle flows back)
  {
    id: "e-browser-mcp-proxy",
    source: "mcp-proxy", sourceHandle: "left-src",
    target: "browser", targetHandle: "right-tgt",
    label: "HTML bundle",
    animated: true,
    style: { stroke: "#3b82f6" },
    ...edgeBase,
  },
  // Streaming Lambda → Claude
  {
    id: "e-sl-claude",
    source: "stream-lambda", sourceHandle: "right",
    target: "claude", targetHandle: "left",
    label: "streamText() + tools",
    animated: true,
    style: { stroke: "#d97757" },
    ...edgeBase,
  },
  // Claude → MCP Server
  {
    id: "e-claude-mcp",
    source: "claude", sourceHandle: "right",
    target: "mcp-server", targetHandle: "top",
    label: "MCP protocol",
    animated: true,
    style: { stroke: "#22c55e" },
    ...edgeBase,
  },
  // MCP Server → MCP Proxy (response: resource content flows back)
  {
    id: "e-proxy-mcp",
    source: "mcp-server", sourceHandle: "left-src",
    target: "mcp-proxy", targetHandle: "right-tgt",
    label: "resources/read",
    animated: true,
    style: { stroke: "#22c55e" },
    ...edgeBase,
  },
];

// ── Section ───────────────────────────────────────────────────────────────────

const HANDLE_CSS = `
  .show-handles .react-flow__handle { opacity: 1 !important; }
  .react-flow__node-group { border: none !important; background: none !important; padding: 0 !important; }
`;

export function McpAppsSection() {
  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, , onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [copied, setCopied] = useState(false);
  const [showHandles, setShowHandles] = useState(false);

  function copyLayout() {
    const text = nodes.map(n =>
      `  { id: "${n.id}", x: ${Math.round(n.position.x)}, y: ${Math.round(n.position.y)} },`
    ).join("\n");
    const write = () => {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    };
    (navigator.clipboard?.writeText(text) ?? Promise.reject())
      .catch(write)
      .finally(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <section>
      <style>{HANDLE_CSS}</style>
      <h2 className="text-base font-semibold mb-3" style={{ color: C.fg }}>
        MCP Apps
      </h2>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border, height: 360 }}>
        <ReactFlow
          className={showHandles ? "show-handles" : undefined}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStart={() => setShowHandles(true)}
          onNodeDragStop={() => setShowHandles(false)}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesConnectable={false}
          elementsSelectable={true}
          proOptions={{ hideAttribution: true }}
          style={{ background: C.bgCanvas }}
        >
          <Background variant={BackgroundVariant.Lines} gap={24} lineWidth={0.5} color={C.border} />
          <Panel position="top-right">
            <button
              onClick={copyLayout}
              style={{
                fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                border: `1px solid ${C.border}`, background: C.bgMuted,
                color: copied ? "#22c55e" : C.fg, cursor: "pointer",
              }}
            >
              {copied ? "Copied!" : "Copy layout"}
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </section>
  );
}
