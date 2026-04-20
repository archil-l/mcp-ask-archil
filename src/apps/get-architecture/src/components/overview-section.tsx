import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  NodeResizer,
  Panel,
  Position,
  reconnectEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type NodeTypes,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRef, useState } from "react";
import { C } from "../shared/colors";

import lambdaSvg from "../resources/architecture-service-icons/Arch_Compute/64/Arch_AWS-Lambda_64.svg";
import cloudfrontSvg from "../resources/architecture-service-icons/Arch_Networking-Content-Delivery/64/Arch_Amazon-CloudFront_64.svg";
import s3Svg from "../resources/architecture-service-icons/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg";
import apiGwSvg from "../resources/architecture-service-icons/Arch_Networking-Content-Delivery/64/Arch_Amazon-API-Gateway_64.svg";

// ── Custom node ───────────────────────────────────────────────────────────────

type ServiceNodeData = { label: string; icon: string | null };

const ICON_SIZE = 72;

// Handles are invisible by default; the `.show-handles` class on the ReactFlow
// wrapper makes them visible during node drag or edge reconnect.
const handleStyle = { width: 10, height: 10, background: C.accent, opacity: 0, transition: "opacity 0.15s" };
// Left/right handles need explicit top offset to sit at the icon's vertical center
// (icon 72px + gap 6px + label ~16px = ~94px total; icon center = 36px from top)
const sideHandleStyle = { ...handleStyle, top: 36 };

function BrowserIcon() {
  return (
    <svg viewBox="0 0 72 72" width={ICON_SIZE} height={ICON_SIZE} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="72" rx="14" fill="#3b82f620" />
      <circle cx="36" cy="36" r="20" stroke="#3b82f6" strokeWidth="2" />
      <ellipse cx="36" cy="36" rx="8" ry="20" stroke="#3b82f6" strokeWidth="2" />
      <line x1="16" y1="36" x2="56" y2="36" stroke="#3b82f6" strokeWidth="2" />
      <line x1="18" y1="27" x2="54" y2="27" stroke="#3b82f6" strokeWidth="2" />
      <line x1="18" y1="45" x2="54" y2="45" stroke="#3b82f6" strokeWidth="2" />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg viewBox="0 0 72 72" width={ICON_SIZE} height={ICON_SIZE} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="72" rx="14" fill="#CC785C20" />
      <text x="36" y="46" textAnchor="middle" fontSize="28" fill="#CC785C">✦</text>
    </svg>
  );
}

function ServiceNode({ data }: { data: ServiceNodeData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "transparent" }}>
      <Handle id="top"    type="target" position={Position.Top}    style={handleStyle} />
      <Handle id="left"   type="target" position={Position.Left}   style={sideHandleStyle} />
      {data.icon === "browser"
        ? <BrowserIcon />
        : data.icon === "claude"
        ? <ClaudeIcon />
        : <img src={data.icon as string} alt="" width={ICON_SIZE} height={ICON_SIZE} style={{ display: "block" }} />}
      <span style={{ fontSize: 12, fontWeight: 600, color: C.fg, lineHeight: 1.2, textAlign: "center", maxWidth: ICON_SIZE }}>
        {data.label}
      </span>
      <Handle id="bottom" type="source" position={Position.Bottom} style={handleStyle} />
      <Handle id="right"  type="source" position={Position.Right}  style={sideHandleStyle} />
    </div>
  );
}

// ── Group node ────────────────────────────────────────────────────────────────

type GroupNodeData = { label: string; color: string };

function GroupNode({ data, selected }: { data: GroupNodeData; selected?: boolean }) {
  return (
    <>
      <NodeResizer
        color={data.color}
        isVisible={selected}
        minWidth={200}
        minHeight={100}
        lineStyle={{ strokeDasharray: "4 3" }}
      />
      <div style={{
        width: "100%", height: "100%",
        border: `1px dashed ${data.color}`,
        borderRadius: 14,
        background: `${data.color}08`,
        position: "relative",
      }}>
        <span style={{
          position: "absolute", top: -10, left: 14,
          background: C.bgCanvas,
          padding: "0 6px",
          fontSize: 11, fontWeight: 600, letterSpacing: "0.03em",
          color: data.color,
          opacity: 0.8,
        }}>
          {data.label}
        </span>
      </div>
    </>
  );
}

const nodeTypes: NodeTypes = {
  service: ServiceNode as unknown as NodeTypes[string],
  group:   GroupNode  as unknown as NodeTypes[string],
};

// ── Initial layout ────────────────────────────────────────────────────────────

const INITIAL_NODES: Node[] = [
  // ── Groups (must come before children) ───────────────────────────────────────
  {
    id: "g-homepage", type: "group", position: { x: 130, y: 20 },
    style: { width: 503, height: 367 },
    data: { label: "ask.archil.io", color: "#3b82f6" } as GroupNodeData,
  },
  {
    id: "g-mcp", type: "group", position: { x: 714, y: 243 },
    style: { width: 504, height: 146 },
    data: { label: "mcp apps / tools", color: "#22c55e" } as GroupNodeData,
  },

  // ── Standalone ────────────────────────────────────────────────────────────────
  { id: "browser", type: "service", position: { x: 0, y: 160 }, data: { label: "Browser", icon: "browser" } as ServiceNodeData },

  // ── Group 1: ask.archil.io ────────────────────────────────────────────────────
  { id: "cloudfront",    type: "service", position: { x: 20,  y: 140 }, parentId: "g-homepage", extent: "parent", data: { label: "CloudFront",       icon: cloudfrontSvg } as ServiceNodeData },
  { id: "web-lambda",    type: "service", position: { x: 210, y: 30  }, parentId: "g-homepage", extent: "parent", data: { label: "Web Lambda",       icon: lambdaSvg     } as ServiceNodeData },
  { id: "s3-assets",     type: "service", position: { x: 400, y: 30  }, parentId: "g-homepage", extent: "parent", data: { label: "S3 Assets",        icon: s3Svg         } as ServiceNodeData },
  { id: "stream-lambda", type: "service", position: { x: 210, y: 250 }, parentId: "g-homepage", extent: "parent", data: { label: "Stream Lambda",    icon: lambdaSvg     } as ServiceNodeData },
  { id: "claude",        type: "service", position: { x: 400, y: 250 }, parentId: "g-homepage", extent: "parent", data: { label: "Claude Haiku 4.5", icon: "claude"      } as ServiceNodeData },

  // ── Group 2: mcp apps / tools ─────────────────────────────────────────────────
  { id: "api-gw",     type: "service", position: { x: 26,  y: 27 }, parentId: "g-mcp", extent: "parent", data: { label: "API Gateway", icon: apiGwSvg  } as ServiceNodeData },
  { id: "mcp-lambda", type: "service", position: { x: 206, y: 27 }, parentId: "g-mcp", extent: "parent", data: { label: "MCP Lambda",  icon: lambdaSvg } as ServiceNodeData },
  { id: "s3-pdf",     type: "service", position: { x: 386, y: 27 }, parentId: "g-mcp", extent: "parent", data: { label: "S3 (PDF)",    icon: s3Svg     } as ServiceNodeData },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e-browser-cf",                          source: "browser",       sourceHandle: "right",  target: "cloudfront",    targetHandle: "left",  label: "HTTPS",            animated: true,  style: { stroke: "#3b82f6" }, labelStyle: { fontSize: 10 } },
  { id: "e-cf-web",                              source: "cloudfront",    sourceHandle: "right",  target: "web-lambda",    targetHandle: "left",  label: "HTTPS / SSR",      animated: true,  style: { stroke: "#3b82f6" }, labelStyle: { fontSize: 10 } },
  { id: "xy-edge__cloudfrontright-stream-lambdaleft", source: "cloudfront", sourceHandle: "right", target: "stream-lambda", targetHandle: "left",  label: "/stream",          animated: true,  style: { stroke: "#3b82f6" }, labelStyle: { fontSize: 10 } },
  { id: "e-web-s3",                              source: "web-lambda",    sourceHandle: "right",  target: "s3-assets",     targetHandle: "left",  label: "static assets",    animated: false, style: { stroke: "#6b7280" }, labelStyle: { fontSize: 10 } },
  { id: "e-sl-claude",                           source: "stream-lambda", sourceHandle: "right",  target: "claude",        targetHandle: "left",  label: "SSE / tool calls", animated: true,  style: { stroke: "#8b5cf6" }, labelStyle: { fontSize: 10 } },
  { id: "e-claude-mcp",                          source: "claude",        sourceHandle: "right",  target: "api-gw",        targetHandle: "left",  label: "MCP protocol",     animated: true,  style: { stroke: "#22c55e" }, labelStyle: { fontSize: 10 } },
  { id: "e-apigw-mcp",                           source: "api-gw",        sourceHandle: "right",  target: "mcp-lambda",    targetHandle: "left",                             animated: true,  style: { stroke: "#6b7280", strokeDasharray: "5 4" } },
  { id: "e-mcp-s3",                              source: "mcp-lambda",    sourceHandle: "right",  target: "s3-pdf",        targetHandle: "left",  label: "read PDF",         animated: false, style: { stroke: "#6b7280" }, labelStyle: { fontSize: 10 } },
];

// ── Section ───────────────────────────────────────────────────────────────────

const HANDLE_CSS = `
  .show-handles .react-flow__handle { opacity: 1 !important; }
  .react-flow__node-group { border: none !important; background: none !important; padding: 0 !important; }
`;

export function OverviewSection() {
  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES);
  const [edgeState, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [copied, setCopied] = useState(false);
  const [showHandles, setShowHandles] = useState(false);
  const edgeReconnectSuccessful = useRef(true);

  function onReconnectStart() {
    edgeReconnectSuccessful.current = false;
    setShowHandles(true);
  }

  function onReconnect(oldEdge: Edge, newConnection: Connection) {
    edgeReconnectSuccessful.current = true;
    setEdges(es => reconnectEdge(oldEdge, newConnection, es) as Edge[]);
  }

  function onReconnectEnd(_: MouseEvent | TouchEvent, edge: Edge) {
    setShowHandles(false);
    if (!edgeReconnectSuccessful.current) {
      setEdges(es => es.filter(e => e.id !== edge.id));
    }
  }

  function copyLayout() {
    const nodeLines = nodes.map(n => {
      const base = `  { id: "${n.id}", x: ${Math.round(n.position.x)}, y: ${Math.round(n.position.y)}`;
      const size = n.measured ? `, w: ${Math.round(n.measured.width ?? 0)}, h: ${Math.round(n.measured.height ?? 0)}` : "";
      return base + (n.type === "group" ? size : "") + ` },`;
    }).join("\n");
    const edgeLines = edgeState
      .map(e => `  { id: "${e.id}", source: "${e.source}", sourceHandle: "${e.sourceHandle}", target: "${e.target}", targetHandle: "${e.targetHandle}" },`)
      .join("\n");
    const text = `// node positions:\n[\n${nodeLines}\n]\n\n// edge connections:\n[\n${edgeLines}\n]`;

    const write = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    };

    (navigator.clipboard?.writeText(text) ?? Promise.reject())
      .catch(write)
      .finally(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  }

  return (
    <section>
      <style>{HANDLE_CSS}</style>
      <h2 className="text-base font-semibold mb-3" style={{ color: C.fg }}>
        AWS Infrastructure
      </h2>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border, height: 340 }}>
        <ReactFlow
          className={showHandles ? "show-handles" : undefined}
          nodes={nodes}
          edges={edgeState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStart={() => setShowHandles(true)}
          onNodeDragStop={() => setShowHandles(false)}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          nodesConnectable={true}
          onConnect={() => {}}
          elementsSelectable={true}
          reconnectRadius={20}
          proOptions={{ hideAttribution: true }}
          style={{ background: C.bgCanvas }}
        >
          <Background variant={BackgroundVariant.Lines} gap={24} lineWidth={0.5} color={C.border} />
          <Controls />
          <Panel position="top-right">
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={copyLayout}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  background: C.bgMuted,
                  color: copied ? C.green : C.fg,
                  cursor: "pointer",
                }}
              >
                {copied ? "Copied!" : "Copy layout"}
              </button>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </section>
  );
}
