import { AppBridge, PostMessageTransport } from "@modelcontextprotocol/ext-apps/app-bridge";
import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useEffect, useRef } from "react";
import { mockHostContext } from "./mockHostContext.js";

interface MockHostWrapperProps {
  appSrc: string;
  onReady: (bridge: AppBridge) => void;
  hostContext?: McpUiHostContext;
}

export function MockHostWrapper({ appSrc, onReady, hostContext = mockHostContext }: MockHostWrapperProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const bridgeRef = useRef<AppBridge | null>(null);

  useEffect(() => {
    return () => {
      bridgeRef.current?.close();
    };
  }, []);

  function handleLoad() {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    bridgeRef.current?.close();

    const bridge = new AppBridge(
      null,
      { name: "DevHost", version: "0.0.0" },
      { serverTools: { listChanged: false } },
      { hostContext },
    );
    bridgeRef.current = bridge;

    bridge.oninitialized = () => {
      onReady(bridge);
    };

    const transport = new PostMessageTransport(
      iframe.contentWindow,
      iframe.contentWindow,
    );

    bridge.connect(transport).catch(console.error);
  }

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "6px 10px", background: "#f0f0f0", borderBottom: "1px solid #ddd", fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>Dev Host</span>
        <span style={{ opacity: 0.5 }}>→</span>
        <span style={{ fontFamily: "monospace" }}>{appSrc}</span>
        <button
          onClick={() => iframeRef.current?.contentWindow?.location.reload()}
          style={{ marginLeft: "auto", fontSize: "11px", padding: "2px 8px", cursor: "pointer" }}
        >
          Reset
        </button>
      </div>
      <iframe
        ref={iframeRef}
        src={appSrc}
        onLoad={handleLoad}
        style={{ flex: 1, border: "none", width: "100%" }}
        title="MCP App Preview"
      />
    </div>
  );
}
