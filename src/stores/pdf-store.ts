import { create } from 'zustand'
import { PDFDocument as PDFLibDocument, rgb } from 'pdf-lib'

export interface PDFPage {
  id: string
  pageNumber: number
  thumbnail: string
  isSelected: boolean
  isCover: boolean
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
  editingMode: 'view' | 'edit' | 'cover'
  isProcessing: boolean
  currentPageIndex: number
  
  // Actions
  setDocument: (document: PDFDocument) => void
  selectPage: (pageId: string) => void
  deselectPage: (pageId: string) => void
  togglePageSelection: (pageId: string) => void
  setEditingMode: (mode: 'view' | 'edit' | 'cover') => void
  setProcessing: (processing: boolean) => void
  deletePage: (pageId: string) => void
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
  
  deletePage: (pageId) => set((state) => {
    console.log('Store deletePage called with:', pageId)
    if (!state.currentDocument) {
      console.log('No current document, returning state')
      return state
    }
    
    const oldPages = state.currentDocument.pages
    console.log('Current pages:', oldPages.map(p => p.id))
    
    if (oldPages.length <= 1) {
      console.log('Cannot delete last page')
      return state
    }
    
    const delIndex = oldPages.findIndex(p => p.id === pageId)
    console.log('Delete index:', delIndex)
    
    if (delIndex === -1) {
      console.log('Page not found')
      return state
    }
    
    const pages = oldPages.filter(page => page.id !== pageId)
    const totalPages = state.currentDocument.totalPages - 1
    let currentPageIndex = state.currentPageIndex
    
    if (delIndex !== -1) {
      if (currentPageIndex > delIndex) currentPageIndex -= 1
      if (currentPageIndex >= pages.length) currentPageIndex = Math.max(0, pages.length - 1)
    }
    
    console.log('New pages count:', pages.length)
    console.log('New current page index:', currentPageIndex)
    
    return {
      currentDocument: {
        ...state.currentDocument,
        pages,
        totalPages
      },
      selectedPages: state.selectedPages.filter(id => id !== pageId),
      currentPageIndex
    }
  }),
  
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
          pages: doc.pages.map((p, idx) => idx === pageIndex ? { ...p, thumbnail: dataUrl } : p)
        }
      })
    } catch (e) {
      console.error('Failed to apply cover edit to PDF', e)
      // Fallback: at least update thumbnail
      set((s) => s.currentDocument ? ({
        currentDocument: {
          ...s.currentDocument,
          pages: s.currentDocument.pages.map((p, idx) => idx === pageIndex ? { ...p, thumbnail: dataUrl } : p)
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
