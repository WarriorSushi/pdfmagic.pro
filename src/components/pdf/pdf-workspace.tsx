'use client'

import { usePDFStore } from '@/stores/pdf-store'
import { PDFViewer } from './pdf-viewer'
import { PageThumbnails } from './page-thumbnails'
import { CoverEditor } from './cover-editor'
import { ExportDialog } from './export-dialog'

export function PDFWorkspace() {
  const { currentDocument, editingMode } = usePDFStore()

  if (!currentDocument) {
    return null
  }

  return (
    <div className="mt-8 border rounded-lg bg-card">
      <div className="flex h-[600px]">
        {/* Left Sidebar - Page Thumbnails */}
        <div className="w-64 border-r bg-muted/30">
          <PageThumbnails />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {editingMode === 'cover' ? (
            <CoverEditor />
          ) : (
            <PDFViewer />
          )}
        </div>

        {/* Right Sidebar - Tools & Properties */}
        <div className="w-80 border-l bg-muted/30 p-4">
          <ExportDialog />
        </div>
      </div>
    </div>
  )
}
