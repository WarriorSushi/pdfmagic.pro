'use client'

import { useState, useEffect, useRef } from 'react'
import { usePDFStore } from '@/stores/pdf-store'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCw, Download, Type, X } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import { exportPDF } from '@/lib/pdf-utils'

// Ensure worker is configured (also configured in lib/pdf-utils.ts)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export function PDFViewer() {
  const { currentDocument, currentPageIndex, setCurrentPageIndex, selectedPages, setEditingMode } = usePDFStore()
  const [zoom, setZoom] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)

  const handleExport = async () => {
    if (!currentDocument) return
    
    setIsExporting(true)
    try {
      const blob = await exportPDF(currentDocument, selectedPages)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentDocument.name.replace('.pdf', '')}_edited.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }


  if (!currentDocument || currentDocument.pages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <p className="text-muted-foreground">No PDF loaded</p>
      </div>
    )
  }

  // Rendering handled by react-pdf <Document>/<Page>

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPageIndex + 1} of {currentDocument.totalPages}
          </span>
          <Button size="sm" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      {/* PDF Display Area */}
      <div className="flex-1 overflow-auto bg-muted/10 p-8">
        <div className="flex justify-center">
          <div className="bg-white shadow-lg relative" ref={pageRef}>
            {currentDocument.pages[currentPageIndex]?.editedDataUrl ? (
              // Show edited page if available
              <img 
                src={currentDocument.pages[currentPageIndex].editedDataUrl} 
                alt={`Edited page ${currentPageIndex + 1}`}
                style={{ 
                  width: `${600 * zoom}px`,
                  height: 'auto',
                  display: 'block'
                }}
              />
            ) : (
              // Show original PDF page
              <Document file={currentDocument.file} onLoadError={console.error} loading={<div className="p-6 text-sm text-muted-foreground">Loading PDF…</div>}>
                <Page
                  pageNumber={currentPageIndex + 1}
                  scale={zoom}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Document>
            )}
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="border-t p-4 flex items-center justify-center gap-4 bg-background">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPageIndex === 0}
          onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {currentDocument.pages.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentPageIndex 
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              onClick={() => setCurrentPageIndex(index)}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          disabled={currentPageIndex === currentDocument.pages.length - 1}
          onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
