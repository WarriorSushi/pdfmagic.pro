'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Canvas, Textbox as FabricTextbox, Rect as FabricRect, Circle as FabricCircle, Image as FabricImage } from 'fabric'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Type, Image, Square, Circle, Undo, Redo, Save, Trash2, Palette, FileText } from 'lucide-react'
import { usePDFStore } from '@/stores/pdf-store'
import { renderPDFPageHighRes } from '@/lib/pdf-utils'
import { extractTextFromPDF, type ExtractedText } from '@/lib/text-extraction'

export function CoverEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank')
  const [selectedColor, setSelectedColor] = useState<string>('#3b82f6')
  const [fontSize, setFontSize] = useState<number>(24)
  const [fontFamily, setFontFamily] = useState<string>('Arial')
  const [isTextEditMode, setIsTextEditMode] = useState(false)
  const [extractedTexts, setExtractedTexts] = useState<ExtractedText[]>([])
  const historyRef = useRef<string[]>([])
  const redoRef = useRef<string[]>([])
  const suppressHistoryRef = useRef(false)
  const { currentDocument, currentPageIndex, setEditingMode, applyCoverEditToPage } = usePDFStore()

  // Initialize canvas once
  useEffect(() => {
    if (!canvasRef.current || canvas) return
    
    console.log('Initializing Fabric canvas...')
    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 600,
      height: 800,
      backgroundColor: '#ffffff'
    })
    
    // Set interactive properties
    fabricCanvas.selection = true
    fabricCanvas.preserveObjectStacking = true
    
    setCanvas(fabricCanvas)
    console.log('Canvas initialized:', fabricCanvas)
    
    return () => {
      console.log('Disposing canvas')
      fabricCanvas.dispose()
    }
  }, [])

  // Load high-resolution PDF page as background
  const editingPage = currentDocument?.pages[currentPageIndex ?? 0] ?? currentDocument?.pages[0]
  const pageNumber = editingPage?.pageNumber || 1

  useEffect(() => {
    if (!canvas || !currentDocument?.file) {
      console.log('Canvas or document not ready:', { canvas: !!canvas, file: !!currentDocument?.file })
      return
    }

    console.log('Loading high-res PDF page:', pageNumber)
    let aborted = false
    
    const loadBackground = async () => {
      try {
        const highResDataUrl = await renderPDFPageHighRes(currentDocument.file, pageNumber, 2)
        if (aborted || !canvas) return

        const img = await FabricImage.fromURL(highResDataUrl, { crossOrigin: 'anonymous' })
        if (aborted || !canvas) return

        console.log('High-res page loaded:', img.width, 'x', img.height)

        // Calculate scale to fit canvas
        const canvasWidth = 600
        const canvasHeight = 800
        const scale = Math.min(canvasWidth / img.width!, canvasHeight / img.height!)
        
        img.set({
          left: 0,
          top: 0,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false
        })
        ;(img as any).isBackground = true
        
        canvas.add(img)
        try { (canvas as any).sendToBack?.(img) } catch { (canvas as any).moveTo?.(img, 0) }
        
        // Extract text if in text edit mode
        if (isTextEditMode) {
          const texts = await extractTextFromPDF(currentDocument.file, currentPageIndex + 1)
          setExtractedTexts(texts)
          
          // Add text objects to canvas
          texts.forEach(textItem => {
            const fabricText = new FabricTextbox(textItem.text, {
              left: textItem.x * scale,
              top: textItem.y * scale,
              width: textItem.width * scale,
              fontSize: textItem.fontSize * scale,
              fontFamily: 'Arial',
              fill: '#000000',
              backgroundColor: 'rgba(255, 255, 0, 0.2)',
              borderColor: 'rgba(255, 255, 0, 0.8)',
              cornerColor: 'rgba(255, 255, 0, 0.8)',
              transparentCorners: false,
              hasRotatingPoint: false
            })
            
            canvas.add(fabricText)
          })
        }
        
        canvas.requestRenderAll()
        console.log('High-res background set successfully')
        
        // Initialize history
        historyRef.current = [JSON.stringify(canvas.toJSON())]
        redoRef.current = []
        
      } catch (error) {
        console.error('Failed to load high-res background:', error)
      }
    }
    
    loadBackground()
    
    return () => {
      aborted = true
    }
  }, [canvas, currentDocument, currentPageIndex, isTextEditMode])

  const pushHistory = () => {
    if (!canvas || suppressHistoryRef.current) return
    historyRef.current.push(JSON.stringify(canvas.toJSON()))
    // keep history bounded to avoid memory blowup
    if (historyRef.current.length > 50) historyRef.current.shift()
    redoRef.current = []
  }

  // Track changes made by user interactions (move/resize/etc.)
  useEffect(() => {
    if (!canvas) return
    const onModified = () => { pushHistory(); canvas.requestRenderAll() }
    canvas.on('object:modified', onModified)
    return () => {
      canvas.off('object:modified', onModified)
    }
  }, [canvas])

  const undo = async () => {
    if (!canvas) return
    if (historyRef.current.length <= 1) return
    const current = JSON.stringify(canvas.toJSON())
    const prev = historyRef.current[historyRef.current.length - 2]
    redoRef.current.push(current)
    historyRef.current.pop()
    await canvas.loadFromJSON(prev)
    canvas.requestRenderAll()
  }

  const redo = async () => {
    if (!canvas) return
    const next = redoRef.current.pop()
    if (!next) return
    historyRef.current.push(next)
    await canvas.loadFromJSON(next)
    canvas.requestRenderAll()
  }

  const addText = () => {
    if (!canvas) {
      console.log('Canvas not ready for addText')
      return
    }
    
    console.log('Adding text...')
    const text = new FabricTextbox('Click to edit text', {
      left: 100,
      top: 100,
      fontFamily: fontFamily,
      fontSize: fontSize,
      fill: selectedColor,
      width: 200,
      editable: true,
      selectable: true
    })
    
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.requestRenderAll()
    pushHistory()
    
    console.log('Text added:', text)
  }

  const addRectangle = () => {
    if (!canvas) {
      console.log('Canvas not ready for addRectangle')
      return
    }
    
    console.log('Adding rectangle...')
    const rect = new FabricRect({
      left: 150,
      top: 150,
      width: 200,
      height: 100,
      fill: selectedColor,
      stroke: selectedColor,
      strokeWidth: 2,
      selectable: true
    })
    
    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.requestRenderAll()
    pushHistory()
    
    console.log('Rectangle added:', rect)
  }

  const addCircle = () => {
    if (!canvas) {
      console.log('Canvas not ready for addCircle')
      return
    }
    
    console.log('Adding circle...')
    const circle = new FabricCircle({
      left: 200,
      top: 200,
      radius: 50,
      fill: selectedColor,
      stroke: selectedColor,
      strokeWidth: 2,
      selectable: true
    })
    
    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.requestRenderAll()
    pushHistory()
    
    console.log('Circle added:', circle)
  }

  const addImageFromFile = async (file: File) => {
    if (!canvas) return
    const url = URL.createObjectURL(file)
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
      // Fit the added image to 60% of canvas width
      const cW = canvas.getWidth()
      const cH = canvas.getHeight()
      const iW = img.width ?? 1
      const iH = img.height ?? 1
      const maxW = cW * 0.6
      const maxH = cH * 0.6
      const scale = Math.min(maxW / iW, maxH / iH)
      img.set({ left: (cW - iW * scale) / 2, top: (cH - iH * scale) / 2, scaleX: scale, scaleY: scale, selectable: true })
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.requestRenderAll()
      pushHistory()
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const deletePageContent = () => {
    if (!canvas) return
    
    console.log('Deleting page content...')
    // Remove all objects except background
    const objects = canvas.getObjects().slice()
    objects.forEach(obj => {
      if (!(obj as any).isBackground) {
        canvas.remove(obj)
      }
    })
    
    canvas.requestRenderAll()
    pushHistory()
    console.log('Page content deleted')
  }

  const createBlankPage = () => {
    if (!canvas) return
    
    console.log('Creating blank page...')
    // Remove all objects including background
    canvas.clear()
    canvas.backgroundColor = '#ffffff'
    canvas.requestRenderAll()
    
    // Initialize history
    historyRef.current = [JSON.stringify(canvas.toJSON())]
    redoRef.current = []
    console.log('Blank page created')
  }

  const updateSelectedObjectColor = (color: string) => {
    if (!canvas) return
    
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      activeObject.set('fill', color)
      if (activeObject.type === 'textbox') {
        activeObject.set('fill', color)
      }
      canvas.requestRenderAll()
      pushHistory()
    }
  }

  const updateSelectedTextSize = (size: number) => {
    if (!canvas) return
    
    const activeObject = canvas.getActiveObject()
    if (activeObject && activeObject.type === 'textbox') {
      activeObject.set('fontSize', size)
      canvas.requestRenderAll()
      pushHistory()
    }
  }

  const updateSelectedTextFont = (font: string) => {
    if (!canvas) return
    
    const activeObject = canvas.getActiveObject()
    if (activeObject && activeObject.type === 'textbox') {
      activeObject.set('fontFamily', font)
      canvas.requestRenderAll()
      pushHistory()
    }
  }

  const onImageUploadClick = () => fileInputRef.current?.click()
  const onImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) addImageFromFile(file)
    // reset input so same file can be re-selected later
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const applyTemplate = (templateId: string) => {
    if (!canvas) return
    suppressHistoryRef.current = true
    try {
      // Remove all objects except background
      const objects = canvas.getObjects().slice()
      objects.forEach(obj => {
        if (!(obj as any).data?.isBackground) canvas.remove(obj)
      })

      const cW = canvas.getWidth()
      const cH = canvas.getHeight()

      if (templateId === 'blank') {
        // nothing
      } else if (templateId === 'business') {
        // Header bar + big title
        const header = new FabricRect({ left: 0, top: 0, width: cW, height: cH * 0.18, fill: '#1d4ed8' })
        const title = new FabricTextbox('Business Report', {
          left: cW * 0.08,
          top: cH * 0.22,
          width: cW * 0.84,
          fontSize: Math.max(28, Math.round(cW * 0.06)),
          fontFamily: 'Arial',
          fill: '#111827',
        })
        canvas.add(header, title)
      } else if (templateId === 'academic') {
        const title = new FabricTextbox('Academic Paper Title', {
          left: cW * 0.1,
          top: cH * 0.18,
          width: cW * 0.8,
          fontSize: Math.max(26, Math.round(cW * 0.05)),
          fontFamily: 'Times New Roman',
          fill: '#111827',
        })
        const subtitle = new FabricTextbox('Subtitle or Author Name', {
          left: cW * 0.1,
          top: cH * 0.3,
          width: cW * 0.8,
          fontSize: Math.max(18, Math.round(cW * 0.035)),
          fill: '#374151',
        })
        canvas.add(title, subtitle)
      } else if (templateId === 'creative') {
        const blob = new FabricCircle({ left: cW * 0.2, top: cH * 0.15, radius: Math.min(cW, cH) * 0.18, fill: '#f59e0b' })
        const title = new FabricTextbox('Creative Design', {
          left: cW * 0.1,
          top: cH * 0.5,
          width: cW * 0.8,
          fontSize: Math.max(30, Math.round(cW * 0.06)),
          fill: '#111827',
        })
        canvas.add(blob, title)
      }
    } finally {
      suppressHistoryRef.current = false
      pushHistory()
      canvas?.requestRenderAll()
    }
  }

  const templates = [
    { id: 'blank', name: 'Blank Canvas', preview: '/templates/blank.jpg' },
    { id: 'business', name: 'Business Report', preview: '/templates/business.jpg' },
    { id: 'academic', name: 'Academic Paper', preview: '/templates/academic.jpg' },
    { id: 'creative', name: 'Creative Design', preview: '/templates/creative.jpg' }
  ]

  return (
    <div className="flex-1 flex">
      {/* Canvas Area */}
      <div className="flex-1 p-8 bg-muted/10">
        <div className="flex justify-center">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <canvas ref={canvasRef} className="border" />
            {/* Hidden file input for image uploads */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageFileChange} />
          </div>
        </div>
      </div>

      {/* Right Panel - Tools & Templates */}
      <div className="w-80 border-l bg-background p-4 overflow-y-auto">
        {/* Toolbar */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button 
                size="sm" 
                variant={isTextEditMode ? "default" : "outline"}
                onClick={async () => {
                  const newMode = !isTextEditMode
                  setIsTextEditMode(newMode)
                  
                  if (!canvas || !currentDocument || currentPageIndex === null) return
                  
                  // Clear existing objects except background
                  canvas.getObjects().forEach(obj => {
                    if (!(obj as any).isBackground) {
                      canvas.remove(obj)
                    }
                  })
                  
                  if (newMode) {
                    // Extract and add text objects
                    try {
                      const texts = await extractTextFromPDF(currentDocument.file, currentPageIndex + 1)
                      setExtractedTexts(texts)
                      
                      // Get background scale
                      const backgroundImg = canvas.getObjects().find(obj => (obj as any).isBackground)
                      const scale = backgroundImg ? (backgroundImg as any).scaleX : 1
                      
                      texts.forEach(textItem => {
                        const fabricText = new FabricTextbox(textItem.text, {
                          left: textItem.x * scale,
                          top: textItem.y * scale,
                          width: textItem.width * scale,
                          fontSize: Math.max(textItem.fontSize * scale, 8),
                          fontFamily: 'Arial',
                          fill: '#000000',
                          backgroundColor: 'rgba(255, 255, 0, 0.2)',
                          borderColor: 'rgba(255, 255, 0, 0.8)',
                          cornerColor: 'rgba(255, 255, 0, 0.8)',
                          transparentCorners: false,
                          hasRotatingPoint: false
                        })
                        
                        canvas.add(fabricText)
                      })
                      
                      canvas.requestRenderAll()
                    } catch (error) {
                      console.error('Failed to extract text:', error)
                    }
                  } else {
                    canvas.requestRenderAll()
                  }
                }}
                className="col-span-2"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isTextEditMode ? 'Exit Text Edit' : 'Edit Text'}
              </Button>
              <Button size="sm" onClick={addText}>
                <Type className="h-4 w-4 mr-1" />
                Text
              </Button>
              <Button size="sm" onClick={addRectangle}>
                <Square className="h-4 w-4 mr-1" />
                Rect
              </Button>
              <Button size="sm" onClick={addCircle}>
                <Circle className="h-4 w-4 mr-1" />
                Circle
              </Button>
              <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                <Image className="h-4 w-4 mr-1" />
                Image
              </Button>
            </div>
            
            {/* Page Actions */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={deletePageContent}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Page
              </Button>
              <Button variant="outline" size="sm" onClick={createBlankPage}>
                <Palette className="h-4 w-4 mr-2" />
                Blank Page
              </Button>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={undo}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={redo}>
                <Redo className="h-4 w-4" />
              </Button>
              <Button size="sm" className="flex-1" onClick={async () => {
                if (!canvas) return
                // Use PNG to avoid black background issues and keep fidelity
                const dataUrl = canvas.toDataURL({ multiplier: 2, format: 'png' })
                await applyCoverEditToPage(currentPageIndex ?? 0, dataUrl)
                setEditingMode('view')
              }}>
                <Save className="h-4 w-4 mr-2" />
                Save Page
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Style Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Style</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Color Picker */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {['#000000', '#ffffff', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded border-2 ${
                      selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color)
                      updateSelectedObjectColor(color)
                    }}
                  />
                ))}
                {/* Rainbow/Multicolor picker button */}
                <button
                  className={`w-8 h-8 rounded border-2 ${
                    selectedColor.includes('gradient') ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{
                    background: 'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080)'
                  }}
                  onClick={() => {
                    document.getElementById('full-color-picker')?.click()
                  }}
                  title="Full Color Spectrum"
                />
              </div>
              <input
                id="full-color-picker"
                type="color"
                value={selectedColor.startsWith('#') ? selectedColor : '#3b82f6'}
                onChange={(e) => {
                  setSelectedColor(e.target.value)
                  updateSelectedObjectColor(e.target.value)
                }}
                className="mt-2 w-full h-8 rounded border"
              />
            </div>
            
            {/* Font Size */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Font Size: {fontSize}px</label>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => {
                  setFontSize(value[0])
                  updateSelectedTextSize(value[0])
                }}
                max={72}
                min={8}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Font Family */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Font</label>
              <Select value={fontFamily} onValueChange={(value) => {
                setFontFamily(value)
                updateSelectedTextFont(value)
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`
                    relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all
                    ${selectedTemplate === template.id 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-muted hover:border-primary/50'
                    }
                  `}
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    applyTemplate(template.id)
                  }}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {template.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
