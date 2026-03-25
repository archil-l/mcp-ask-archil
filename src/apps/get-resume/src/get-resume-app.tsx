/**
 * @file React PDF viewer MCP App for displaying resume from S3.
 * Uses the PDFViewer component for minimalistic rendering.
 */
import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { StrictMode, useCallback, useEffect, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Download, RefreshCw } from "lucide-react";
import { PDFViewer } from "@/components/pdf-viewer/pdf-viewer.js";
import { Button } from "@/components/ui/button.js";
import { Spinner } from "@/components/ui/spinner.js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.js";
import "@/styles/globals.css";

interface ResumeData {
  pdfBase64?: string;
  filename?: string;
}

function extractResumeData(result: CallToolResult): ResumeData {
  const structured = result.structuredContent as ResumeData | undefined;
  return {
    pdfBase64: structured?.pdfBase64,
    filename: structured?.filename ?? "resume.pdf",
  };
}

function ResumeViewerApp() {
  const [toolResult, setToolResult] = useState<CallToolResult | null>(null);
  const [hostContext, setHostContext] = useState<
    McpUiHostContext | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { app, error: connectionError } = useApp({
    appInfo: { name: "Resume Viewer", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => {
        console.info("Resume Viewer app is being torn down");
        return {};
      };

      app.ontoolinput = async (input) => {
        console.info("Received tool call input:", input);
        setIsLoading(true);
      };

      app.ontoolresult = async (result) => {
        console.info("Received tool call result:", result);
        setToolResult(result);
        setIsLoading(false);
        if (result.isError) {
          const errorText = result.content?.find((c) => c.type === "text");
          setError(
            errorText?.type === "text"
              ? errorText.text
              : "Failed to load resume"
          );
        } else {
          setError(null);
        }
      };

      app.ontoolcancelled = (params) => {
        console.info("Tool call cancelled:", params.reason);
        setIsLoading(false);
        setError("Resume loading was cancelled");
      };

      app.onerror = (err) => {
        console.error("App error:", err);
        setError(String(err));
      };

      app.onhostcontextchanged = (params) => {
        setHostContext((prev) => ({ ...prev, ...params }));
      };
    },
  });

  useEffect(() => {
    if (app) {
      setHostContext(app.getHostContext());
    }
  }, [app]);

  if (connectionError) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-destructive">
          <strong>Connection Error:</strong> {connectionError.message}
        </p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <div className="flex items-center gap-3">
          <Spinner className="size-5" />
          <p className="text-muted-foreground">Connecting to host...</p>
        </div>
      </div>
    );
  }

  return (
    <ResumeViewerInner
      app={app}
      toolResult={toolResult}
      hostContext={hostContext}
      isLoading={isLoading}
      error={error}
    />
  );
}

interface ResumeViewerInnerProps {
  app: App;
  toolResult: CallToolResult | null;
  hostContext?: McpUiHostContext;
  isLoading: boolean;
  error: string | null;
}

function ResumeViewerInner({
  app,
  toolResult,
  hostContext,
  isLoading,
  error,
}: ResumeViewerInnerProps) {
  const resumeData = useMemo(() => {
    if (!toolResult || toolResult.isError) return null;
    return extractResumeData(toolResult);
  }, [toolResult]);

  const pdfDataUrl = useMemo(() => {
    if (!resumeData?.pdfBase64) return null;
    return `data:application/pdf;base64,${resumeData.pdfBase64}`;
  }, [resumeData]);

  const handleDownload = useCallback(async () => {
    if (!resumeData?.pdfBase64) return;

    const hostCapabilities = app.getHostCapabilities();
    if (hostCapabilities?.downloadFile) {
      try {
        await app.downloadFile({
          contents: [
            {
              type: "resource",
              resource: {
                uri: `file:///${resumeData.filename ?? "resume.pdf"}`,
                mimeType: "application/pdf",
                blob: resumeData.pdfBase64,
              },
            },
          ],
        });
        return;
      } catch (err) {
        console.error("downloadFile failed, trying fallback:", err);
      }
    }

    try {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${resumeData.pdfBase64}`;
      link.download = resumeData.filename ?? "resume.pdf";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Native download failed:", err);
      alert(
        "Download not supported in this environment. Right-click on the PDF and select 'Save as' or use your browser's print function (Ctrl/Cmd+P) to save as PDF."
      );
    }
  }, [app, resumeData]);

  const handleRefresh = useCallback(async () => {
    try {
      await app.callServerTool({ name: "get-resume", arguments: {} });
    } catch (err) {
      console.error("Failed to refresh resume:", err);
    }
  }, [app]);

  return (
    <TooltipProvider>
      <main
        className="flex h-full w-full flex-col bg-background"
        style={{
          paddingTop: hostContext?.safeAreaInsets?.top,
          paddingRight: hostContext?.safeAreaInsets?.right,
          paddingBottom: hostContext?.safeAreaInsets?.bottom,
          paddingLeft: hostContext?.safeAreaInsets?.left,
        }}
      >
        {/* Minimal header */}
        <header className="flex items-center justify-between border-b px-4 py-2">
          <h1 className="truncate text-sm font-medium text-foreground">
            {resumeData?.filename ?? "Resume"}
          </h1>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`size-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>

            {pdfDataUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleDownload}
                  >
                    <Download className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>
            )}
          </div>
        </header>

        {/* Content area */}
        <div className="relative flex-1 overflow-hidden">
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-3">
                <Spinner className="size-8" />
                <p className="text-sm text-muted-foreground">
                  Loading resume...
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
              <div className="flex max-w-sm flex-col items-center gap-4 p-6 text-center">
                <div className="text-4xl">⚠️</div>
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!pdfDataUrl && !isLoading && !error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="text-5xl">📄</div>
                <div>
                  <h2 className="text-lg font-medium">No Resume Loaded</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click below to load the resume
                  </p>
                </div>
                <Button onClick={handleRefresh}>Load Resume</Button>
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          {pdfDataUrl && !isLoading && !error && (
            <PDFViewer
              pdfDataUrl={pdfDataUrl}
              showPagination={true}
              showZoomOnHover={true}
              className="h-full"
            />
          )}
        </div>
      </main>
    </TooltipProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ResumeViewerApp />
  </StrictMode>
);