"use client";

import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
  loading: () => <p className="text-sm text-slate-400">読み込み中...</p>,
});

export default function PdfViewerClient({ pdfUrl }: { pdfUrl: string }) {
  return <PdfViewer pdfUrl={pdfUrl} />;
}
