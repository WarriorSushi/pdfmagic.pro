import { pdfjs } from 'react-pdf'
import { PDFDocument, PDFPage } from '@/stores/pdf-store'

// Configure PDF.js worker to match react-pdf's internal pdfjs-dist@5.3.93
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export async function processPDFFile(file: File): Promise<PDFDocument> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  
  const pages: PDFPage[] = []
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 0.5 })
    
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.height = viewport.height
    canvas.width = viewport.width
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise
    
    const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
    
    pages.push({
      id: `page-${i}`,
      pageNumber: i,
      thumbnail,
      isSelected: false,
      isCover: i <= 3 // Mark first 3 pages as potential covers
    })
  }
  
  return {
    id: `doc-${Date.now()}`,
    name: file.name,
    file,
    pages,
    totalPages: pdf.numPages
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
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.height = viewport.height
  canvas.width = viewport.width
  
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise
  
  return canvas.toDataURL('image/png', 1.0)
}

export async function exportPDF(document: PDFDocument, selectedPages: string[]): Promise<Blob> {
  try {
    if (selectedPages.length === 0) {
      // No pages selected, return original file
      return new Blob([await document.file.arrayBuffer()], { type: 'application/pdf' })
    }

    // Import pdf-lib for PDF manipulation
    const { PDFDocument: PDFLibDocument } = await import('pdf-lib')
    
    // Load the original PDF
    const existingPdfBytes = await document.file.arrayBuffer()
    const pdfDoc = await PDFLibDocument.load(existingPdfBytes)
    
    // Create a new PDF with only selected pages
    const newPdf = await PDFLibDocument.create()
    
    // Get page numbers from selected page IDs
    const selectedPageNumbers = selectedPages
      .map(pageId => {
        const page = document.pages.find(p => p.id === pageId)
        return page ? page.pageNumber - 1 : -1 // Convert to 0-based index
      })
      .filter(num => num >= 0)
      .sort((a, b) => a - b)
    
    // Copy selected pages to new PDF
    const copiedPages = await newPdf.copyPages(pdfDoc, selectedPageNumbers)
    copiedPages.forEach(page => newPdf.addPage(page))
    
    // Save the new PDF
    const pdfBytes = await newPdf.save()
    return new Blob([pdfBytes], { type: 'application/pdf' })
    
  } catch (error) {
    console.error('Failed to export PDF:', error)
    // Fallback: return original file
    return new Blob([await document.file.arrayBuffer()], { type: 'application/pdf' })
  }
}
