'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Download, Settings, FileText, Image } from 'lucide-react'
import { usePDFStore } from '@/stores/pdf-store'
import { exportPDF } from '@/lib/pdf-utils'

export function ExportDialog() {
  const { currentDocument, selectedPages } = usePDFStore()
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'images'>('pdf')
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high')

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
    } finally {
      setIsExporting(false)
    }
  }

  if (!currentDocument) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upload a PDF to start editing and exporting
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Export Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Document Info</h4>
          <p className="text-sm text-muted-foreground">
            {currentDocument.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {currentDocument.totalPages} pages
          </p>
          {selectedPages.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedPages.length} pages selected
            </p>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-2">Export Format</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={exportFormat === 'pdf' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportFormat('pdf')}
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              variant={exportFormat === 'images' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportFormat('images')}
            >
              <Image className="h-4 w-4 mr-2" />
              Images
            </Button>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Quality</h4>
          <div className="space-y-2">
            {(['high', 'medium', 'low'] as const).map((q) => (
              <label key={q} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="quality"
                  value={q}
                  checked={quality === q}
                  onChange={(e) => setQuality(e.target.value as typeof quality)}
                  className="text-primary"
                />
                <span className="text-sm capitalize">{q} Quality</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Advanced Export Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Compression Level</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="80"
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Page Range</label>
                  <input
                    type="text"
                    placeholder="e.g., 1-5, 8, 10-12"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="watermark" />
                  <label htmlFor="watermark" className="text-sm">
                    Add watermark (Pro feature)
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
