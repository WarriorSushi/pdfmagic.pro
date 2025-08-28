import { pdfjs } from 'react-pdf'

export interface ExtractedText {
  text: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontFamily: string
  transform: number[]
}

export async function extractTextFromPDF(file: File, pageNumber: number): Promise<ExtractedText[]> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    const page = await pdf.getPage(pageNumber)
    
    // Get text content with positioning
    const textContent = await page.getTextContent()
    
    const viewport = page.getViewport({ scale: 1 })
    const extractedTexts: ExtractedText[] = []
    
    textContent.items.forEach((item: any) => {
      if (item.str && item.str.trim()) {
        // Convert PDF coordinates to canvas coordinates
        const transform = item.transform
        const x = transform[4]
        const y = viewport.height - transform[5] // Flip Y coordinate
        const fontSize = Math.abs(transform[0]) || 12
        const width = item.width || fontSize * item.str.length * 0.6
        const height = item.height || fontSize
        
        extractedTexts.push({
          text: item.str,
          x,
          y: y - fontSize, // Adjust for text baseline
          width,
          height: fontSize,
          fontSize,
          fontFamily: item.fontName || 'Arial',
          transform
        })
      }
    })
    
    return extractedTexts
  } catch (error) {
    console.error('Failed to extract text:', error)
    return []
  }
}
