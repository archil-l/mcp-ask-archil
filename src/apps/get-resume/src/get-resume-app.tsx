/**
 * @file React PDF viewer MCP App for displaying resume from S3.
 * Uses react-pdf for rendering PDFs on canvas (works in iframe contexts).
 */
import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  StrictMode,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { createRoot } from "react-dom/client";
import { Document, Page, pdfjs } from "react-pdf";
import "./global.css";

// Configure PDF.js worker from CDN (works with single-file builds)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
              : "Failed to load resume",
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
      <div style={{ padding: "20px", color: "red" }}>
        <strong>Connection Error:</strong> {connectionError.message}
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Connecting to host...</p>
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
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resumeData = useMemo(() => {
    if (!toolResult || toolResult.isError) return null;
    return extractResumeData(toolResult);
  }, [toolResult]);

  const pdfDataUrl = useMemo(() => {
    if (!resumeData?.pdfBase64) return null;
    return `data:application/pdf;base64,${resumeData.pdfBase64}`;
  }, [resumeData]);

  // Reset page number when PDF changes
  useEffect(() => {
    setPageNumber(1);
    setPdfError(null);
  }, [pdfDataUrl]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setPdfError(null);
    },
    [],
  );

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error("PDF load error:", err);
    setPdfError(err.message);
  }, []);

  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(3.0, prev + 0.25));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.5, prev - 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  const handleDownload = useCallback(() => {
    if (!pdfDataUrl || !resumeData) return;

    const link = document.createElement("a");
    link.href = pdfDataUrl;
    link.download = resumeData.filename ?? "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pdfDataUrl, resumeData]);

  const handleRefresh = useCallback(async () => {
    try {
      await app.callServerTool({ name: "get-resume", arguments: {} });
    } catch (err) {
      console.error("Failed to refresh resume:", err);
    }
  }, [app]);

  const displayError = error || pdfError;

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        paddingTop: hostContext?.safeAreaInsets?.top,
        paddingRight: hostContext?.safeAreaInsets?.right,
        paddingBottom: hostContext?.safeAreaInsets?.bottom,
        paddingLeft: hostContext?.safeAreaInsets?.left,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-ring-primary, #e5e7eb)",
          backgroundColor: "var(--color-background-primary)",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
          📄 {resumeData?.filename ?? "Resume Viewer"}
        </h1>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid var(--color-ring-primary, #d1d5db)",
              backgroundColor: "var(--color-background-primary)",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            🔄 Refresh
          </button>
          {pdfDataUrl && (
            <button
              onClick={handleDownload}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "var(--color-accent, #2563eb)",
                color: "var(--color-text-on-accent, white)",
                cursor: "pointer",
              }}
            >
              ⬇️ Download
            </button>
          )}
        </div>
      </header>

      {/* PDF Controls */}
      {pdfDataUrl && !isLoading && !displayError && numPages > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 16px",
            borderBottom: "1px solid var(--color-ring-primary, #e5e7eb)",
            backgroundColor: "var(--color-background-secondary, #f9fafb)",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid var(--color-ring-primary, #d1d5db)",
                backgroundColor: "var(--color-background-primary)",
                cursor: pageNumber <= 1 ? "not-allowed" : "pointer",
                opacity: pageNumber <= 1 ? 0.5 : 1,
              }}
            >
              ◀ Prev
            </button>
            <span style={{ minWidth: "100px", textAlign: "center" }}>
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid var(--color-ring-primary, #d1d5db)",
                backgroundColor: "var(--color-background-primary)",
                cursor: pageNumber >= numPages ? "not-allowed" : "pointer",
                opacity: pageNumber >= numPages ? 0.5 : 1,
              }}
            >
              Next ▶
            </button>
          </div>

          {/* Zoom Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid var(--color-ring-primary, #d1d5db)",
                backgroundColor: "var(--color-background-primary)",
                cursor: scale <= 0.5 ? "not-allowed" : "pointer",
                opacity: scale <= 0.5 ? 0.5 : 1,
              }}
            >
              ➖
            </button>
            <button
              onClick={resetZoom}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid var(--color-ring-primary, #d1d5db)",
                backgroundColor: "var(--color-background-primary)",
                cursor: "pointer",
                minWidth: "60px",
              }}
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={zoomIn}
              disabled={scale >= 3.0}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid var(--color-ring-primary, #d1d5db)",
                backgroundColor: "var(--color-background-primary)",
                cursor: scale >= 3.0 ? "not-allowed" : "pointer",
                opacity: scale >= 3.0 ? 0.5 : 1,
              }}
            >
              ➕
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: "auto",
          position: "relative",
          backgroundColor: "#525659",
        }}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--color-background-primary)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid var(--color-ring-primary, #e5e7eb)",
                  borderTopColor: "var(--color-accent, #2563eb)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <p>Loading resume...</p>
            </div>
          </div>
        )}

        {displayError && !isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--color-background-primary)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "24px",
                maxWidth: "400px",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
              <h2 style={{ marginBottom: "8px", color: "#dc2626" }}>Error</h2>
              <p
                style={{
                  color: "var(--color-text-primary)",
                  marginBottom: "16px",
                }}
              >
                {displayError}
              </p>
              <button
                onClick={handleRefresh}
                style={{
                  padding: "10px 20px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "var(--color-accent, #2563eb)",
                  color: "var(--color-text-on-accent, white)",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {pdfDataUrl && !isLoading && !displayError && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
              minHeight: "100%",
            }}
          >
            <Document
              file={pdfDataUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div style={{ color: "white", padding: "20px" }}>
                  Loading PDF...
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={
                  <div style={{ color: "white", padding: "20px" }}>
                    Loading page...
                  </div>
                }
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        )}

        {!pdfDataUrl && !isLoading && !displayError && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--color-background-primary)",
            }}
          >
            <div style={{ textAlign: "center", padding: "24px" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>📄</div>
              <h2 style={{ marginBottom: "8px" }}>No Resume Loaded</h2>
              <p
                style={{
                  color: "var(--color-text-primary)",
                  marginBottom: "16px",
                }}
              >
                Click the button below to load the resume.
              </p>
              <button
                onClick={handleRefresh}
                style={{
                  padding: "10px 20px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "var(--color-accent, #2563eb)",
                  color: "var(--color-text-on-accent, white)",
                  cursor: "pointer",
                }}
              >
                Load Resume
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ResumeViewerApp />
  </StrictMode>,
);
