import { create } from 'zustand'
import { PDFDocument as PDFLibDocument, rgb } from 'pdf-lib'

export interface PDFPage {
  id: string
  pageNumber: number
  thumbnail: string
  isSelected: boolean
  isCover: boolean
  editedDataUrl?: string // Store edited page data
}

export interface PDFDocument {
  id: string
  name: string
  file: File
  pages: PDFPage[]
  totalPages: number
}

interface PDFStore {
  currentDocument: PDFDocument | null
  selectedPages: string[]
  editingMode: 'view' | 'edit' | 'cover' | 'text'
  isProcessing: boolean
  currentPageIndex: number
  
  // Actions
  setDocument: (document: PDFDocument) => void
  selectPage: (pageId: string) => void
  deselectPage: (pageId: string) => void
  togglePageSelection: (pageId: string) => void
  setEditingMode: (mode: 'view' | 'edit' | 'cover' | 'text') => void
  setProcessing: (processing: boolean) => void
  deletePage: (pageId: string) => Promise<void>
  markAsCover: (pageId: string) => void
  setCurrentPageIndex: (index: number) => void
  viewPageById: (pageId: string) => void
  updatePageThumbnail: (pageId: string, thumbnail: string) => void
  applyCoverEditToPage: (pageIndex: number, dataUrl: string) => Promise<void>
  clearDocument: () => void
}

export const usePDFStore = create<PDFStore>((set, get) => ({
  currentDocument: null,
  selectedPages: [],
  editingMode: 'view',
  isProcessing: false,
  currentPageIndex: 0,

  setDocument: (document) => set({ currentDocument: document, currentPageIndex: 0, selectedPages: [] }),
  
  selectPage: (pageId) => set((state) => ({
    selectedPages: [...state.selectedPages, pageId]
  })),
  
  deselectPage: (pageId) => set((state) => ({
    selectedPages: state.selectedPages.filter(id => id !== pageId)
  })),
  
  togglePageSelection: (pageId) => {
    const { selectedPages } = get()
    if (selectedPages.includes(pageId)) {
      get().deselectPage(pageId)
    } else {
      get().selectPage(pageId)
    }
  },
  
  setEditingMode: (mode) => set({ editingMode: mode }),
  
  setProcessing: (processing) => set({ isProcessing: processing }),
  
  deletePage: async (pageId) => {
    const state = get()
    console.log('Store deletePage called with:', pageId)
    if (!state.currentDocument) {
      console.log('No current document, returning')
      return
    }
    
    const oldPages = state.currentDocument.pages
    console.log('Current pages:', oldPages.map(p => p.id))
    
    if (oldPages.length <= 1) {
      console.log('Cannot delete last page')
      return
    }
    
    const delIndex = oldPages.findIndex(p => p.id === pageId)
    console.log('Delete index:', delIndex)
    
    if (delIndex === -1) {
      console.log('Page not found')
      return
    }
    
    try {
      // Import pdf-lib for PDF manipulation
      const { PDFDocument: PDFLibDocument } = await import('pdf-lib')
      
      // Load the original PDF
      const existingPdfBytes = await state.currentDocument.file.arrayBuffer()
      const pdfDoc = await PDFLibDocument.load(existingPdfBytes)
      
      // Remove the page from PDF
      pdfDoc.removePage(delIndex)
      
      // Save the modified PDF
      const newPdfBytes = await pdfDoc.save()
      const newFile = new File([newPdfBytes], state.currentDocument.name, { type: 'application/pdf' })
      
      // Update pages array and indices
      const pages = oldPages.filter(page => page.id !== pageId)
      const totalPages = pages.length
      let currentPageIndex = state.currentPageIndex
      
      if (delIndex !== -1) {
        if (currentPageIndex > delIndex) currentPageIndex -= 1
        if (currentPageIndex >= pages.length) currentPageIndex = Math.max(0, pages.length - 1)
      }
      
      // Update page numbers to be sequential
      const updatedPages = pages.map((page, index) => ({
        ...page,
        pageNumber: index + 1
      }))
      
      console.log('New pages count:', updatedPages.length)
      console.log('New current page index:', currentPageIndex)
      
      set({
        currentDocument: {
          ...state.currentDocument,
          file: newFile,
          pages: updatedPages,
          totalPages
        },
        selectedPages: state.selectedPages.filter(id => id !== pageId),
        currentPageIndex
      })
      
    } catch (error) {
      console.error('Failed to delete page from PDF:', error)
      // Fallback to just removing from state if PDF manipulation fails
      const pages = oldPages.filter(page => page.id !== pageId)
      const totalPages = pages.length
      let currentPageIndex = state.currentPageIndex
      
      if (delIndex !== -1) {
        if (currentPageIndex > delIndex) currentPageIndex -= 1
        if (currentPageIndex >= pages.length) currentPageIndex = Math.max(0, pages.length - 1)
      }
      
      const updatedPages = pages.map((page, index) => ({
        ...page,
        pageNumber: index + 1
      }))
      
      set({
        currentDocument: {
          ...state.currentDocument,
          pages: updatedPages,
          totalPages
        },
        selectedPages: state.selectedPages.filter(id => id !== pageId),
        currentPageIndex
      })
    }
  },
  
  markAsCover: (pageId) => set((state) => {
    if (!state.currentDocument) return state
    
    return {
      currentDocument: {
        ...state.currentDocument,
        pages: state.currentDocument.pages.map(page => ({
          ...page,
          isCover: page.id === pageId
        }))
      }
    }
  }),

  setCurrentPageIndex: (index) => set((state) => {
    if (!state.currentDocument) return state
    const max = state.currentDocument.pages.length - 1
    const clamped = Math.min(Math.max(index, 0), max)
    return { currentPageIndex: clamped }
  }),

  viewPageById: (pageId) => set((state) => {
    if (!state.currentDocument) return state
    const idx = state.currentDocument.pages.findIndex(p => p.id === pageId)
    if (idx === -1) return state
    return { currentPageIndex: idx, editingMode: state.editingMode }
  }),

  updatePageThumbnail: (pageId, thumbnail) => set((state) => {
    if (!state.currentDocument) return state
    return {
      currentDocument: {
        ...state.currentDocument,
        pages: state.currentDocument.pages.map(p => p.id === pageId ? { ...p, thumbnail } : p)
      }
    }
  }),
  
  applyCoverEditToPage: async (pageIndex, dataUrl) => {
    const state = get()
    const doc = state.currentDocument
    if (!doc) return
    try {
      const existingBytes = await doc.file.arrayBuffer()
      const pdfDoc = await PDFLibDocument.load(existingBytes)
      const pages = pdfDoc.getPages()
      const page = pages[pageIndex]
      if (!page) return

      const imgBytes = await (await fetch(dataUrl)).arrayBuffer()
      const isPng = dataUrl.startsWith('data:image/png')
      const embedded = isPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes)
      const { width, height } = page.getSize()
      // Draw white background to prevent black page artifacts
      page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) })
      // Draw full-bleed overlay
      page.drawImage(embedded, { x: 0, y: 0, width, height })

      const newPdfBytes = await pdfDoc.save()
      const newFile = new File([newPdfBytes], doc.name, { type: 'application/pdf' })

      set({
        currentDocument: {
          ...doc,
          file: newFile,
          pages: doc.pages.map((p, idx) => idx === pageIndex ? { ...p, thumbnail: dataUrl, editedDataUrl: dataUrl } : p)
        }
      })
    } catch (e) {
      console.error('Failed to apply cover edit to PDF', e)
      // Fallback: at least update thumbnail and edited data
      set((s) => s.currentDocument ? ({
        currentDocument: {
          ...s.currentDocument,
          pages: s.currentDocument.pages.map((p, idx) => idx === pageIndex ? { ...p, thumbnail: dataUrl, editedDataUrl: dataUrl } : p)
        }
      }) : s)
    }
  },
  
  clearDocument: () => set({
    currentDocument: null,
    selectedPages: [],
    editingMode: 'view',
    isProcessing: false,
    currentPageIndex: 0
  })
}))
