import { pdfjs } from 'react-pdf'
import { PDFDocument, PDFPage } from '@/stores/pdf-store'

// Configure PDF.js worker to match react-pdf's internal pdfjs-dist@5.3.93
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export async function processPDFFile(file: File): Promise<PDFDocument> {
  try {
    console.log('Processing PDF:', file.name, 'Size:', file.size, 'Type:', file.type)
    
    const arrayBuffer = await file.arrayBuffer()
    console.log('ArrayBuffer size:', arrayBuffer.byteLength)
    
    const pdf = await pdfjs.getDocument({ 
      data: arrayBuffer,
      // Enhanced compatibility options
      verbosity: 0, // Reduce console spam
      cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
      // Handle corrupted PDFs
      stopAtErrors: false,
      maxImageSize: 1024 * 1024 * 50, // 50MB max image size
      disableFontFace: false,
      disableRange: false,
      disableStream: false
    }).promise
    
    console.log('PDF loaded successfully. Pages:', pdf.numPages)
  
    const pages: PDFPage[] = []
    
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        console.log(`Processing page ${i}/${pdf.numPages}`)
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.5 })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
          // Enhanced rendering options for compatibility
          intent: 'display',
          transform: null,
          background: 'white'
        }).promise
        
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
        
        pages.push({
          id: `page-${i}`,
          pageNumber: i,
          thumbnail,
          isSelected: false,
          isCover: i <= 3 // Mark first 3 pages as potential covers
        })
        
      } catch (pageError) {
        console.warn(`Failed to process page ${i}:`, pageError)
        // Create a placeholder page for failed pages
        pages.push({
          id: `page-${i}`,
          pageNumber: i,
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIExvYWRpbmcgUGFnZTwvdGV4dD48L3N2Zz4=',
          isSelected: false,
          isCover: i <= 3
        })
      }
    }
  
    console.log('Successfully processed', pages.length, 'pages')
    
    return {
      id: `doc-${Date.now()}`,
      name: file.name,
      file,
      pages,
      totalPages: pdf.numPages
    }
    
  } catch (error) {
    console.error('Failed to process PDF file:', error)
    throw new Error(`Failed to load PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function detectCoverPages(pages: PDFPage[]): string[] {
  // Simple heuristic: first 1-3 pages are likely covers
  return pages
    .filter((page, index) => index < 3)
    .map(page => page.id)
}

// Render a specific PDF page at high resolution for editing
export async function renderPDFPageHighRes(file: File, pageNumber: number, scale: number = 2): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ 
      data: arrayBuffer,
      verbosity: 0,
      stopAtErrors: false
    }).promise
    
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale })
    
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.height = viewport.height
    canvas.width = viewport.width
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
      intent: 'display',
      background: 'white'
    }).promise
    
    return canvas.toDataURL('image/png', 1.0)
    
  } catch (error) {
    console.error('Failed to render high-res page:', error)
    // Return a placeholder image
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjlmYWZiIiBzdHJva2U9IiNlNWU3ZWIiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yjc0ODUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvciBMb2FkaW5nIFBhZ2U8L3RleHQ+PC9zdmc+'
  }
}

export async function exportPDF(document: PDFDocument, selectedPages: string[]): Promise<Blob> {
  try {
    // Import pdf-lib for PDF manipulation
    const { PDFDocument: PDFLibDocument, rgb } = await import('pdf-lib')
    
    // Load the original PDF
    const existingPdfBytes = await document.file.arrayBuffer()
    const pdfDoc = await PDFLibDocument.load(existingPdfBytes)
    
    // Create a new PDF
    const newPdf = await PDFLibDocument.create()
    
    // Determine which pages to export
    const pagesToExport = selectedPages.length === 0 
      ? document.pages // Export all pages if none selected
      : document.pages.filter(p => selectedPages.includes(p.id))
    
    // Process each page
    for (const pageData of pagesToExport) {
      const pageIndex = pageData.pageNumber - 1
      
      if (pageData.editedDataUrl) {
        // Use edited version
        try {
          const imgBytes = await (await fetch(pageData.editedDataUrl)).arrayBuffer()
          const isPng = pageData.editedDataUrl.startsWith('data:image/png')
          const embedded = isPng ? await newPdf.embedPng(imgBytes) : await newPdf.embedJpg(imgBytes)
          
          // Get original page dimensions
          const originalPage = pdfDoc.getPage(pageIndex)
          const { width, height } = originalPage.getSize()
          
          // Create new page with same dimensions
          const newPage = newPdf.addPage([width, height])
          
          // Draw white background
          newPage.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) })
          
          // Draw edited image
          newPage.drawImage(embedded, { x: 0, y: 0, width, height })
        } catch (error) {
          console.error('Failed to embed edited page, using original:', error)
          // Fallback to original page
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex])
          newPdf.addPage(copiedPage)
        }
      } else {
        // Use original page
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex])
        newPdf.addPage(copiedPage)
      }
    }
    
    // Save the new PDF
    const pdfBytes = await newPdf.save()
    return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
    
  } catch (error) {
    console.error('Failed to export PDF:', error)
    // Fallback: return original file
    return new Blob([await document.file.arrayBuffer()], { type: 'application/pdf' })
  }
}
