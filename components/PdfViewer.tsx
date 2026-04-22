"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfViewer({ pdfUrl }: { pdfUrl: string }) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);

  return (
    <div className="flex flex-col items-center gap-6">
      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<p className="text-sm text-slate-400">読み込み中...</p>}
        error={
          <p className="text-sm text-red-400">PDFの読み込みに失敗しました。</p>
        }
      >
        <Page
          pageNumber={page}
          width={616}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="overflow-hidden rounded-lg border border-slate-200 shadow-sm"
        />
      </Document>
      {numPages > 0 && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← 前へ
          </button>
          <span className="text-sm text-slate-500">
            {page} / {numPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={page >= numPages}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            次へ →
          </button>
        </div>
      )}
    </div>
  );
}
