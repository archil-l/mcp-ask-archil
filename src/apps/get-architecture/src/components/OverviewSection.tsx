import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  type NodeTypes,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { C } from "../shared/colors";

// ── Custom node ───────────────────────────────────────────────────────────────

type ServiceNodeData = {
  label: string;
  icon: string;
  iconBg: string;
  group?: string;
  handles?: { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean };
};

function ServiceNode({ data }: { data: ServiceNodeData }) {
  const h = data.handles ?? {};
  return (
    <div style={{
      background: C.bg,
      border: `1.5px solid ${C.border}`,
      borderRadius: 10,
      padding: "8px 12px",
      minWidth: 110,
      textAlign: "center",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
    }}>
      {h.top    && <Handle type="target" position={Position.Top}    style={{ background: C.border }} />}
      {h.left   && <Handle type="target" position={Position.Left}   style={{ background: C.border }} />}
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: data.iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18,
      }}>
        {data.icon}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.fg, lineHeight: 1.2 }}>
        {data.label}
      </span>
      {h.bottom && <Handle type="source" position={Position.Bottom} style={{ background: C.border }} />}
      {h.right  && <Handle type="source" position={Position.Right}  style={{ background: C.border }} />}
    </div>
  );
}

// ── Group label node ──────────────────────────────────────────────────────────

type GroupNodeData = { label: string; color: string };

function GroupNode({ data }: { data: GroupNodeData }) {
  return (
    <div style={{
      width: "100%", height: "100%",
      border: `1.5px dashed ${data.color}`,
      borderRadius: 12,
      background: `${data.color}10`,
      position: "relative",
    }}>
      <span style={{
        position: "absolute", top: -11, left: 12,
        background: C.bg,
        padding: "0 6px",
        fontSize: 10, fontWeight: 700,
        color: data.color,
        borderRadius: 4,
      }}>
        {data.label}
      </span>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  service: ServiceNode as unknown as NodeTypes[string],
  group: GroupNode as unknown as NodeTypes[string],
};

// ── Layout ────────────────────────────────────────────────────────────────────

const nodes: Node[] = [
  // Group: ask.archil.io
  {
    id: "g-homepage", type: "group", position: { x: 20, y: 10 },
    data: { label: "ask.archil.io", color: "#3b82f6" } as GroupNodeData,
    style: { width: 390, height: 200 },
    draggable: false, selectable: false,
  },

  // Group: Anthropic API (outside AWS region — rendered separately)
  {
    id: "g-anthropic", type: "group", position: { x: 440, y: 10 },
    data: { label: "Anthropic API", color: "#8b5cf6" } as GroupNodeData,
    style: { width: 170, height: 200 },
    draggable: false, selectable: false,
  },

  // Group: mcp-ask-archil
  {
    id: "g-mcp", type: "group", position: { x: 640, y: 10 },
    data: { label: "mcp-ask-archil", color: "#22c55e" } as GroupNodeData,
    style: { width: 290, height: 200 },
    draggable: false, selectable: false,
  },

  // Browser (outside groups, at top-left)
  {
    id: "browser", type: "service", position: { x: 440, y: 230 },
    data: {
      label: "Browser",
      icon: "🌐",
      iconBg: "#3b82f620",
      handles: { top: true, bottom: false, left: false, right: false },
    } as ServiceNodeData,
    draggable: false, selectable: false,
  },

  // ask.archil.io group nodes
  {
    id: "cloudfront", type: "service", position: { x: 20, y: 60 }, parentId: "g-homepage",
    data: {
      label: "CloudFront",
      icon: "☁️",
      iconBg: "#8C4FFF20",
      handles: { bottom: true, right: true },
    } as ServiceNodeData,
    draggable: false, selectable: false,
    extent: "parent",
  },
  {
    id: "web-lambda", type: "service", position: { x: 180, y: 60 }, parentId: "g-homepage",
    data: {
      label: "Web Lambda",
      icon: "λ",
      iconBg: "#E8741A20",
      handles: { left: true, right: false, bottom: true },
    } as ServiceNodeData,
    draggable: false, selectable: false,
    extent: "parent",
  },
  {
    id: "stream-lambda", type: "service", position: { x: 20, y: 130 }, parentId: "g-homepage",
    data: {
      label: "Stream Lambda",
      icon: "λ",
      iconBg: "#E8741A20",
      handles: { top: true, right: true },
    } as ServiceNodeData,
    draggable: false, selectable: false,
    extent: "parent",
  },
  {
    id: "s3-assets", type: "service", position: { x: 200, y: 130 }, parentId: "g-homepage",
    data: {
      label: "S3 Assets",
      icon: "🪣",
      iconBg: "#3F862420",
      handles: { top: true },
    } as ServiceNodeData,
    draggable: false, selectable: false,
    extent: "parent",
  },

  // Anthropic group
  {
    id: "claude", type: "service", position: { x: 20, y: 70 }, parentId: "g-anthropic",
    data: {
      label: "Claude Haiku 4.5",
      icon: "🤖",
      iconBg: "#CC785C20",
      handles: { left: true, right: true },
    } as ServiceNodeData,
    draggable: false, selectable: false,
    extent: "parent",
  },

  // MCP group
  {
    id: "api-gw", type: "service", position: { x: 10, y: 70 }, parentId: "g-mcp",
    data: {
      label: "API Gateway",
      icon: "🔀",
      iconBg: "#E8741A20",
      handles: { left: true, right: true },
    } as ServiceNodeData,
    draggable: false, selectable: false,
    extent: "parent",
  },
  {
    id: "mcp-lambda", type: "service", position: { x: 110, y: 70 }, parentId: "g-mcp",
    data: {
      label: "MCP Lambda",
      icon: "λ",
      iconBg: "#E8741A20",
      handles: { left: true, right: true },
    } as ServiceNodeData,
    draggable: false, selectable: false,
    extent: "parent",
  },
  {
    id: "s3-pdf", type: "service", position: { x: 200, y: 70 }, parentId: "g-mcp",
    data: {
      label: "S3 (PDF)",
      icon: "🪣",
      iconBg: "#3F862420",
      handles: { left: true },
    } as ServiceNodeData,
    draggable: false, selectable: false,
    extent: "parent",
  },
];

const edges: Edge[] = [
  { id: "e-cf-web",    source: "cloudfront",    target: "web-lambda",    label: "HTTPS / SSR",       animated: true, style: { stroke: "#3b82f6" }, labelStyle: { fontSize: 9 } },
  { id: "e-cf-stream", source: "cloudfront",    target: "stream-lambda", label: "/stream",           animated: true, style: { stroke: "#3b82f6" }, labelStyle: { fontSize: 9 } },
  { id: "e-web-s3",   source: "web-lambda",    target: "s3-assets",     label: "static assets",     animated: false, style: { stroke: "#6b7280" }, labelStyle: { fontSize: 9 } },
  { id: "e-sl-claude", source: "stream-lambda", target: "claude",        label: "SSE / tool calls",  animated: true,  style: { stroke: "#8b5cf6" }, labelStyle: { fontSize: 9 } },
  { id: "e-claude-mcp",source: "claude",        target: "api-gw",        label: "MCP protocol",      animated: true,  style: { stroke: "#22c55e" }, labelStyle: { fontSize: 9 } },
  { id: "e-apigw-mcp", source: "api-gw",        target: "mcp-lambda",                                animated: false, style: { stroke: "#6b7280" } },
  { id: "e-mcp-s3",   source: "mcp-lambda",    target: "s3-pdf",        label: "read PDF",          animated: false, style: { stroke: "#6b7280" }, labelStyle: { fontSize: 9 } },
  { id: "e-cf-browser",source: "browser",       target: "cloudfront",    label: "HTTPS",             animated: true,  style: { stroke: "#3b82f6" }, labelStyle: { fontSize: 9 }, type: "straight" },
];

export function OverviewSection() {
  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: C.fg }}>
        AWS Infrastructure
      </h2>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border, height: 340 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
          style={{ background: C.bg }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={C.border} />
        </ReactFlow>
      </div>
    </section>
  );
}
