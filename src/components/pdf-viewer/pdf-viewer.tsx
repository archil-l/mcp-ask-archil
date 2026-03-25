/**
 * @file Minimalistic PDF Viewer component using react-pdf and shadcn/ui.
 * Supports optional pagination and hover-based zoom controls.
 */
import { useCallback, useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { Spinner } from "@/components/ui/spinner.js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.js";
import { ScrollArea } from "@/components/ui/scroll-area.js";
import { cn } from "@/lib/utils.js";

// Configure PDF.js worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface PDFViewerProps {
  /** PDF data URL (data:application/pdf;base64,...) or file URL */
  pdfDataUrl: string | null;
  /** Show pagination controls (default: false) */
  showPagination?: boolean;
  /** Show zoom controls only on hover (default: true) */
  showZoomOnHover?: boolean;
  /** Initial zoom scale (default: 1.0) */
  initialScale?: number;
  /** Minimum zoom scale (default: 0.5) */
  minScale?: number;
  /** Maximum zoom scale (default: 3.0) */
  maxScale?: number;
  /** Zoom step increment (default: 0.25) */
  zoomStep?: number;
  /** Additional class name for the container */
  className?: string;
  /** Callback when PDF loads successfully */
  onLoadSuccess?: (numPages: number) => void;
  /** Callback when PDF fails to load */
  onLoadError?: (error: Error) => void;
}

export function PDFViewer({
  pdfDataUrl,
  showPagination = false,
  showZoomOnHover = true,
  initialScale = 1.0,
  minScale = 0.5,
  maxScale = 3.0,
  zoomStep = 0.25,
  className,
  onLoadSuccess,
  onLoadError,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(initialScale);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when PDF changes
  useEffect(() => {
    setPageNumber(1);
    setScale(initialScale);
    setError(null);
    setIsLoading(true);
  }, [pdfDataUrl, initialScale]);

  const handleDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setIsLoading(false);
      setError(null);
      onLoadSuccess?.(numPages);
    },
    [onLoadSuccess]
  );

  const handleDocumentLoadError = useCallback(
    (err: Error) => {
      console.error("PDF load error:", err);
      setIsLoading(false);
      setError(err.message);
      onLoadError?.(err);
    },
    [onLoadError]
  );

  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(maxScale, prev + zoomStep));
  }, [maxScale, zoomStep]);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(minScale, prev - zoomStep));
  }, [minScale, zoomStep]);

  const resetZoom = useCallback(() => {
    setScale(initialScale);
  }, [initialScale]);

  if (!pdfDataUrl) {
    return null;
  }

  const showControls = showZoomOnHover ? isHovered : true;

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={cn("relative flex h-full w-full flex-col", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center gap-3">
              <Spinner className="size-8" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="text-4xl">⚠️</div>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* PDF Content */}
        <ScrollArea className="flex-1">
          <div className="flex min-h-full justify-center bg-muted/30 p-4">
            <Document
              file={pdfDataUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              loading={null}
              className="flex justify-center"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={null}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
              />
            </Document>
          </div>
        </ScrollArea>

        {/* Floating zoom controls */}
        <div
          className={cn(
            "absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-background/95 p-1 shadow-lg backdrop-blur-sm transition-opacity duration-200",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={zoomOut}
                disabled={scale <= minScale}
              >
                <ZoomOut className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetZoom}
                className="min-w-[3.5rem] text-xs"
              >
                {Math.round(scale * 100)}%
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset zoom</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={zoomIn}
                disabled={scale >= maxScale}
              >
                <ZoomIn className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom in</TooltipContent>
          </Tooltip>

          {/* Pagination controls (optional) */}
          {showPagination && numPages > 1 && (
            <>
              <div className="mx-1 h-4 w-px bg-border" />
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="text-xs"
              >
                ←
              </Button>
              <span className="px-1 text-xs text-muted-foreground">
                {pageNumber}/{numPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="text-xs"
              >
                →
              </Button>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default PDFViewer;