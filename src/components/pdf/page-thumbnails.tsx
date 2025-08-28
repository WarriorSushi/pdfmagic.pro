'use client'

import { useState } from 'react'
import { usePDFStore } from '@/stores/pdf-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trash2, Crown, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PageThumbnails() {
  const { 
    currentDocument,
    selectedPages,
    currentPageIndex,
    viewPageById,
    deletePage, 
    markAsCover,
    setEditingMode 
  } = usePDFStore()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  if (!currentDocument) return null

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Pages ({currentDocument.totalPages})</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingMode('cover')}
        >
          Edit Selected Page
        </Button>
      </div>
      
      <div className="space-y-3">
        {currentDocument.pages.map((page, idx) => (
          <Card
            key={page.id}
            className={cn(
              "relative group cursor-pointer transition-all hover:shadow-md",
              (selectedPages.includes(page.id) || idx === currentPageIndex) && "ring-2 ring-primary",
              page.isCover && "border-amber-200 bg-amber-50"
            )}
            onClick={() => viewPageById(page.id)}
          >
            <div className="p-2">
              <div className="relative">
                <img
                  src={page.thumbnail}
                  alt={`Page ${page.pageNumber}`}
                  className="w-full h-24 object-contain bg-white rounded border"
                />
                
                {/* Delete button in top-right corner */}
                <div className="absolute top-1 right-1 z-20">
                  {deleteConfirm === page.id ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 px-3 text-xs shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Deleting page:', page.id)
                        deletePage(page.id)
                        setDeleteConfirm(null)
                      }}
                    >
                      Confirm
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0 opacity-70 hover:opacity-100 transition-opacity shadow-md"
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Setting delete confirm for:', page.id)
                        setDeleteConfirm(page.id)
                        setTimeout(() => {
                          console.log('Auto-canceling delete confirm for:', page.id)
                          setDeleteConfirm(null)
                        }, 3000) // Auto-cancel after 3s
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {page.isCover && (
                  <div className="absolute top-1 left-1">
                    <Crown className="h-4 w-4 text-amber-500" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100 z-0">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsCover(page.id)
                      }}
                    >
                      <Crown className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        viewPageById(page.id)
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-1 text-center">
                <p className="text-xs font-medium">Page {page.pageNumber}</p>
                {page.isCover && (
                  <p className="text-xs text-amber-600">Cover Page</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
