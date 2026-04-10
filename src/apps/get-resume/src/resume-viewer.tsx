/**
 * @file React PDF viewer MCP App for displaying resume from S3.
 * Uses the PDFViewer component for minimalistic rendering.
 */
import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps"
import { useApp } from "@modelcontextprotocol/ext-apps/react"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { StrictMode, useCallback, useEffect, useState, useMemo } from "react"
import { createRoot } from "react-dom/client"
import { PDFViewer as EmbedPDFViewer } from "@embedpdf/react-pdf-viewer"

import { Button } from "@/components/ui/button.js"
import { Spinner } from "@/components/ui/spinner.js"
import { TooltipProvider } from "@/components/ui/tooltip.js"
import "@/styles/globals.css"

interface ResumeData {
  pdfBase64?: string
  filename?: string
}

function extractResumeData(result: CallToolResult): ResumeData {
  console.group("🔍 extractResumeData()")
  console.log("Input CallToolResult:", result)
  console.log("  isError:", result.isError)
  console.log("  content items:", result.content?.length ?? 0)
  console.log("  structuredContent exists:", !!result.structuredContent)

  const structured = result.structuredContent as ResumeData | undefined

  const extracted = {
    pdfBase64: structured?.pdfBase64,
    filename: structured?.filename ?? "resume.pdf",
  }

  console.log("Extracted ResumeData:", extracted)
  console.log("  pdfBase64 length:", extracted.pdfBase64?.length ?? "MISSING")
  if (!extracted.pdfBase64) {
    console.warn("⚠️ No pdfBase64 found in tool result!")
  }
  console.groupEnd()

  return extracted
}

function ResumeViewerApp() {
  const [toolResult, setToolResult] = useState<CallToolResult | null>(null)
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { app, error: connectionError } = useApp({
    appInfo: { name: "Resume Viewer", version: "1.0.0" },
    capabilities: { availableDisplayModes: ["fullscreen"] },
    onAppCreated: (app) => {
      app.onteardown = async () => {
        console.info("Resume Viewer app is being torn down")
        return {}
      }

      app.ontoolinput = async (input) => {
        console.info("Received tool call input:", input)
        setIsLoading(true)
      }

      app.ontoolresult = async (result) => {
        console.group("📥 ontoolresult EVENT")
        console.info(
          "Received raw tool call result at:",
          new Date().toISOString()
        )
        console.log("Full result object:", result)
        console.log("Result properties:")
        console.log("  isError:", result.isError)
        console.log("  content:", result.content)
        console.log("  structuredContent:", result.structuredContent)
        console.log(
          "  content types:",
          result.content?.map((c) => c.type)
        )

        console.log("⚡ Updating state:")
        console.log("  - setToolResult with received value")
        console.log("  - setIsLoading(false)")

        setToolResult(result)
        setIsLoading(false)

        if (result.isError) {
          console.warn("❌ Result is marked as error")
          const errorText = result.content?.find((c) => c.type === "text")
          const errorMessage =
            errorText?.type === "text"
              ? errorText.text
              : "Failed to load resume"
          console.log("Setting error message:", errorMessage)
          setError(errorMessage)
        } else {
          console.log("✅ Result successful, clearing error state")
          setError(null)
        }

        console.groupEnd()
      }

      app.ontoolcancelled = (params) => {
        console.info("Tool call cancelled:", params.reason)
        setIsLoading(false)
        setError("Resume loading was cancelled")
      }

      app.onerror = (err) => {
        console.error("App error:", err)
        setError(String(err))
      }

      app.onhostcontextchanged = (params) => {
        setHostContext((prev) => ({ ...prev, ...params }))
      }
    },
  })

  useEffect(() => {
    if (app) {
      setHostContext(app.getHostContext())
      app.requestDisplayMode({ mode: "fullscreen" }).catch((err) => {
        console.warn("requestDisplayMode failed:", err)
      })
    }
  }, [app])

  if (connectionError) {
    return (
      <div className="flex items-center justify-center h-full p-5">
        <p className="text-destructive">
          <strong>Connection Error:</strong> {connectionError.message}
        </p>
      </div>
    )
  }

  if (!app || isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-5">
        <div className="flex items-center gap-3">
          <Spinner className="size-5" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ResumeViewerInner
      app={app}
      toolResult={toolResult}
      hostContext={hostContext}
      error={error}
    />
  )
}

interface ResumeViewerInnerProps {
  app: App
  toolResult: CallToolResult | null
  hostContext?: McpUiHostContext
  error: string | null
}

function ResumeViewerInner({
  app,
  toolResult,
  hostContext,
  error,
}: ResumeViewerInnerProps) {
  const resumeData = useMemo(() => {
    console.group("🧠 resumeData useMemo RECALCULATED")
    console.log("ToolResult changed:", !!toolResult)

    if (!toolResult) {
      console.log("❌ No toolResult available, returning null")
      console.groupEnd()
      return null
    }

    if (toolResult.isError) {
      console.log("❌ toolResult is error, returning null")
      console.groupEnd()
      return null
    }

    const data = extractResumeData(toolResult)
    console.log("✅ Extracted resume data:", data)
    console.groupEnd()

    return data
  }, [toolResult])

  const pdfDataUrl = useMemo(() => {
    console.group("🧠 pdfDataUrl useMemo RECALCULATED")
    console.log("ResumeData changed:", !!resumeData)

    if (!resumeData?.pdfBase64) {
      console.log("❌ No pdfBase64 available, returning null")
      console.groupEnd()
      return null
    }

    console.log(
      "✅ Generating data URL with base64 length:",
      resumeData.pdfBase64.length
    )
    const url = `data:application/pdf;base64,${resumeData.pdfBase64}`
    console.log("Generated URL length:", url.length)
    console.groupEnd()

    return url
  }, [resumeData])

  // Render logging
  console.group("🎨 RENDERING ResumeViewerInner")
  console.log("State values:")
  console.log("  error:", error)
  console.log("  has toolResult:", !!toolResult)
  console.log("  has resumeData:", !!resumeData)
  console.log("  has pdfDataUrl:", !!pdfDataUrl)

  let renderState = "unknown"
  if (error) renderState = "ERROR"
  else if (!pdfDataUrl) renderState = "EMPTY"
  else renderState = "PDF_VIEWER"

  console.log("✅ Selected render branch:", renderState)
  console.groupEnd()

  return pdfDataUrl && !error && <EmbedPDFViewer config={{ src: pdfDataUrl }} />
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ResumeViewerApp />
  </StrictMode>
)
