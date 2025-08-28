'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  Type, 
  Square, 
  Circle, 
  Image, 
  Trash2, 
  Palette, 
  Undo, 
  Redo, 
  Save,
  FileText,
  ZoomIn,
  ZoomOut,
  Download,
  ChevronLeft,
  ChevronRight,
  Layout
} from 'lucide-react'
import { usePDFStore } from '@/stores/pdf-store'

interface MobileBottomBarProps {
  mode: 'viewer' | 'editor'
  onEditPage?: () => void
  onAddText?: () => void
  onAddRectangle?: () => void
  onAddCircle?: () => void
  onAddImage?: () => void
  onClear?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onSave?: () => void
  onTextEdit?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onExport?: () => void
  onColorPicker?: () => void
  onTemplates?: () => void
  isTextEditMode?: boolean
  zoom?: number
  selectedColor?: string
}

export function MobileBottomBar({ 
  mode, 
  onEditPage,
  onAddText,
  onAddRectangle,
  onAddCircle,
  onAddImage,
  onClear,
  onUndo,
  onRedo,
  onSave,
  onTextEdit,
  onZoomIn,
  onZoomOut,
  onExport,
  onColorPicker,
  onTemplates,
  isTextEditMode = false,
  zoom = 1,
  selectedColor = '#000000'
}: MobileBottomBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const { currentPageIndex, setCurrentPageIndex, currentDocument } = usePDFStore()

  const showTooltipFor = (text: string) => {
    setShowTooltip(text)
    setTimeout(() => setShowTooltip(null), 2000)
  }

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
      showTooltipFor('Previous Page')
    }
  }

  const handleNextPage = () => {
    if (currentDocument && currentPageIndex < currentDocument.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
      showTooltipFor('Next Page')
    }
  }

  const primaryTools = mode === 'viewer' 
    ? [
        { icon: Edit3, action: onEditPage, label: 'Edit' },
        { icon: ChevronLeft, action: handlePrevPage, label: 'Prev' },
        { icon: ChevronRight, action: handleNextPage, label: 'Next' },
        { icon: ZoomOut, action: onZoomOut, label: 'Zoom-' },
        { icon: ZoomIn, action: onZoomIn, label: 'Zoom+' },
        { icon: Download, action: onExport, label: 'Export' }
      ]
    : [
        { icon: FileText, action: onTextEdit, label: isTextEditMode ? 'Exit' : 'Text', active: isTextEditMode },
        { icon: Type, action: onAddText, label: 'Add' },
        { icon: Square, action: onAddRectangle, label: 'Rect' },
        { icon: Circle, action: onAddCircle, label: 'Circle' },
        { icon: Undo, action: onUndo, label: 'Undo' },
        { icon: Redo, action: onRedo, label: 'Redo' },
        { 
          icon: Palette, 
          action: onColorPicker, 
          label: 'Color',
          customRender: (tool: any, index: number) => (
            <div key={index} className="flex flex-col items-center flex-shrink-0">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    tool.action?.()
                    showTooltipFor(tool.label)
                  }}
                >
                  <tool.icon className="h-3 w-3" />
                </Button>
                {/* Color square - same size as button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 border border-gray-300"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => {
                    tool.action?.()
                    showTooltipFor('Color Picker')
                  }}
                />
              </div>
              <span className="text-[8px] text-muted-foreground mt-0.5 leading-none">
                {tool.label}
              </span>
            </div>
          )
        },
        { icon: Save, action: onSave, label: 'Save', primary: true }
      ]

  const secondaryTools = mode === 'editor' 
    ? [
        { icon: Image, action: onAddImage, label: 'Image' },
        { icon: Trash2, action: onClear, label: 'Clear' },
        { icon: Layout, action: onTemplates, label: 'Template' }
      ]
    : []

  return (
    <>
      {/* Tooltip */}
      {showTooltip && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded z-50 pointer-events-none">
          {showTooltip}
        </div>
      )}

      {/* Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-40">
        {/* Primary Row - Always Visible */}
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-1 flex-1 overflow-x-auto">
            {primaryTools.map((tool, index) => 
              tool.customRender ? tool.customRender(tool, index) : (
                <div key={index} className="flex flex-col items-center flex-shrink-0">
                  <Button
                    variant={tool.active ? "default" : tool.primary ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      tool.action?.()
                      showTooltipFor(tool.label)
                    }}
                  >
                    <tool.icon className="h-3 w-3" />
                  </Button>
                  <span className="text-[8px] text-muted-foreground mt-0.5 leading-none">
                    {tool.label}
                  </span>
                </div>
              )
            )}
          </div>
          
          {/* Expand/Collapse Button */}
          {secondaryTools.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 ml-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Secondary Row - Expandable */}
        {isExpanded && secondaryTools.length > 0 && (
          <div className="flex items-center gap-1 px-2 pb-2 overflow-x-auto border-t">
            {secondaryTools.map((tool, index) => (
              <div key={index} className="flex flex-col items-center flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    tool.action?.()
                    showTooltipFor(tool.label)
                  }}
                >
                  <tool.icon className="h-3 w-3" />
                </Button>
                <span className="text-[8px] text-muted-foreground mt-0.5 leading-none">
                  {tool.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Page Info */}
        {currentDocument && (
          <div className="text-xs text-center text-muted-foreground py-1 border-t">
            Page {currentPageIndex + 1} of {currentDocument.totalPages} • {Math.round(zoom * 100)}%
          </div>
        )}
      </div>
    </>
  )
}
