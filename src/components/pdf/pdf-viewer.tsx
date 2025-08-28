'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePDFStore } from '@/stores/pdf-store'
import { Document, Page, pdfjs } from 'react-pdf'
import { exportPDF } from '@/lib/pdf-utils'
import { MobileBottomBar } from '@/components/mobile/mobile-bottom-bar'
import { usePinchZoom } from '@/hooks/use-pinch-zoom'
import { useEffect } from 'react'

// Configure worker on component load
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

// React-PDF styles handled by Next.js global CSS

export function PDFViewer() {
  const { currentDocument, currentPageIndex, setCurrentPageIndex, selectedPages, setEditingMode } = usePDFStore()
  const [zoom, setZoom] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  
  // Ensure worker is configured when component mounts
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
    console.log('PDF worker configured:', pdfjs.GlobalWorkerOptions.workerSrc)
  }, [])
  
  // Pinch-to-zoom for mobile
  const pinchZoomRef = usePinchZoom({
    onZoom: setZoom,
    minZoom: 0.5,
    maxZoom: 3,
    initialZoom: zoom
  })

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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">No PDF loaded</p>
      </div>
    )
  }

  // Ensure currentPageIndex is valid after page deletions
  const validPageIndex = Math.min(currentPageIndex, currentDocument.pages.length - 1)
  const currentPage = currentDocument.pages[validPageIndex]
  
  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    )
  }

  // Rendering handled by react-pdf <Document>/<Page>

  return (
    <div className="flex-1 flex flex-col pb-20 lg:pb-0">
      {/* Desktop Toolbar - Hidden on mobile */}
      <div className="hidden lg:flex border-b p-4 items-center justify-between bg-background">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={zoom <= 0.5}
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
            disabled={zoom >= 3}
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
      <div className="flex-1 overflow-auto bg-muted/10 p-4 lg:p-8" ref={pinchZoomRef}>
        <div className="flex justify-center">
          <div className="bg-white shadow-lg relative" ref={pageRef}>
            {currentPage.editedDataUrl ? (
              // Show edited page if available
              <img 
                src={currentPage.editedDataUrl} 
                alt={`Edited page ${validPageIndex + 1}`}
                style={{ 
                  width: `${600 * zoom}px`,
                  height: 'auto',
                  display: 'block'
                }}
              />
            ) : pdfError ? (
              <div className="p-6 text-center">
                <p className="text-red-500 mb-2">Failed to load PDF</p>
                <p className="text-sm text-muted-foreground">{pdfError}</p>
              </div>
            ) : (
              // Show original PDF page
              <Document 
                file={currentDocument.file} 
                onLoadSuccess={() => {
                  console.log('PDF loaded successfully')
                  setPdfError(null)
                }}
                onLoadError={(error) => {
                  console.error('PDF load error:', error)
                  setPdfError(error.message || 'Failed to load PDF')
                }} 
                loading={<div className="p-6 text-sm text-muted-foreground">Loading PDF…</div>}
              >
                <Page
                  pageNumber={validPageIndex + 1}
                  scale={zoom}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  onRenderSuccess={() => console.log('Page rendered successfully')}
                  onRenderError={(error) => {
                    console.error('Page render error:', error)
                    setPdfError(error.message || 'Failed to render page')
                  }}
                />
              </Document>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Page Navigation - Hidden on mobile */}
      <div className="hidden lg:flex border-t p-4 items-center justify-center gap-4 bg-background">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPageIndex === 0}
          onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {validPageIndex + 1} of {currentDocument.pages.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPageIndex >= currentDocument.pages.length - 1}
          onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar
        mode="viewer"
        onEditPage={() => setEditingMode('cover')}
        onZoomIn={() => setZoom(Math.min(3, zoom + 0.25))}
        onZoomOut={() => setZoom(Math.max(0.5, zoom - 0.25))}
        onExport={handleExport}
        zoom={zoom}
      />
    </div>
  )
}
