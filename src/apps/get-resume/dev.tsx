import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import type { AppBridge } from "@modelcontextprotocol/ext-apps/app-bridge";
import { MockHostWrapper } from "@/apps/_dev/MockHostWrapper.js";
import mockPdfUrl from "./fixtures/mock-resume.pdf?url";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function onReady(bridge: AppBridge) {
  await bridge.sendToolInput({ arguments: {} });

  const response = await fetch(mockPdfUrl);
  const blob = await response.blob();
  const pdfBase64 = await blobToBase64(blob);

  await bridge.sendToolResult({
    content: [{ type: "text", text: "Resume loaded (mock)" }],
    structuredContent: { pdfBase64, filename: "mock-resume.pdf" },
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MockHostWrapper appSrc="/get-resume-app.html" onReady={onReady} />
  </StrictMode>,
);
