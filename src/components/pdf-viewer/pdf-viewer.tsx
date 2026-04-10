import { PDFViewer as EmbedPDFViewer } from "@embedpdf/react-pdf-viewer";
import { cn } from "@/lib/utils.js";

export interface PDFViewerProps {
  pdfDataUrl: string | null;
  className?: string;
}

export function PDFViewer({ pdfDataUrl, className }: PDFViewerProps) {
  if (!pdfDataUrl) return null;

  return (
    <EmbedPDFViewer
      config={{ src: pdfDataUrl }}
      className={cn("h-full w-full", className)}
    />
  );
}

export default PDFViewer;
