import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, FileText, Image, Layout, Palette } from 'lucide-react'

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: string) => void
}

export function TemplateModal({ isOpen, onClose, onSelectTemplate }: TemplateModalProps) {
  if (!isOpen) return null

  const templates = [
    {
      id: 'business-card',
      name: 'Business Card',
      icon: FileText,
      description: 'Professional business card layout'
    },
    {
      id: 'flyer',
      name: 'Flyer',
      icon: Image,
      description: 'Marketing flyer template'
    },
    {
      id: 'poster',
      name: 'Poster',
      icon: Layout,
      description: 'Event poster design'
    },
    {
      id: 'letterhead',
      name: 'Letterhead',
      icon: FileText,
      description: 'Company letterhead template'
    },
    {
      id: 'brochure',
      name: 'Brochure',
      icon: Palette,
      description: 'Tri-fold brochure layout'
    },
    {
      id: 'certificate',
      name: 'Certificate',
      icon: Layout,
      description: 'Award certificate template'
    }
  ]

  const handleTemplateSelect = (templateId: string) => {
    onSelectTemplate(templateId)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-lg shadow-xl z-50 lg:hidden max-h-[70vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Choose Template</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Templates Grid */}
        <div className="p-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted/50"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <template.icon className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {template.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
          
          {/* Custom Template Option */}
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleTemplateSelect('custom')}
            >
              <Layout className="h-4 w-4 mr-2" />
              Create Custom Template
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
