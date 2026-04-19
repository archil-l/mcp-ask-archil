import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import type { AppBridge } from "@modelcontextprotocol/ext-apps/app-bridge";
import { MockHostWrapper } from "@/apps/_dev/MockHostWrapper.js";

async function onReady(bridge: AppBridge) {
  await bridge.sendToolInput({ arguments: {} });
  await bridge.sendToolResult({
    content: [{ type: "text", text: "Architecture loaded (mock)" }],
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MockHostWrapper appSrc="/get-architecture-app.html" onReady={onReady} />
  </StrictMode>,
);
