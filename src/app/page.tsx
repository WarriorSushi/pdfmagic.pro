'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePDFStore } from '@/stores/pdf-store'
import { PDFUploader } from '@/components/pdf/pdf-uploader'
import { PDFViewer } from '@/components/pdf/pdf-viewer'
import { PageThumbnails } from '@/components/pdf/page-thumbnails'
import { CoverEditor } from '@/components/pdf/cover-editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function HomePage() {
  const { currentDocument, clearDocument, editingMode, setEditingMode } = usePDFStore()

  const scrollToUpload = useCallback(() => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleBackToUpload = useCallback(() => {
    clearDocument()
  }, [clearDocument])

  // Scroll to top when PDF is loaded
  useEffect(() => {
    if (currentDocument) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentDocument])

  // If a PDF is loaded, show the editing interface
  if (currentDocument) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToUpload}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Upload
            </Button>
            {editingMode === 'cover' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingMode('view')}
                className="ml-2"
              >
                Exit Cover Editor
              </Button>
            )}
            <h1 className="font-semibold">PDF Editor - {currentDocument.name}</h1>
          </div>
        </header>

        {/* Main editing interface */}
        <div className="flex h-[calc(100vh-3.5rem)]">
          {/* Sidebar with thumbnails (hidden in cover edit mode) */}
          {editingMode !== 'cover' && (
            <div className="w-80 border-r bg-muted/10">
              <PageThumbnails />
            </div>
          )}

          {/* Main viewer/editor */}
          <div className="flex-1 min-w-0">
            {editingMode === 'cover' ? <CoverEditor /> : <PDFViewer />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional PDF
            <span className="text-blue-600 block">Cover & Page Editor</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Remove, replace, and edit PDF covers and pages with our intuitive browser-based tool. 
            Perfect for professionals, students, and businesses.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={scrollToUpload}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Editing Now →
            </button>
            <button 
              onClick={() => alert('Demo coming soon!')}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Watch Demo
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <div className="h-6 w-6 bg-blue-600 rounded"></div>
              </div>
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">
                Process PDFs in seconds with our optimized engine
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-4">
                <div className="h-6 w-6 bg-green-600 rounded"></div>
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">
                Files are processed locally and deleted after 24 hours
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <div className="h-6 w-6 bg-purple-600 rounded"></div>
              </div>
              <h3 className="font-semibold mb-2">Professional Quality</h3>
              <p className="text-sm text-gray-600">
                Maintain original PDF quality and formatting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <PDFUploader />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful PDF editing tools designed for professionals who demand quality and efficiency
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Smart Upload", desc: "Drag & drop PDFs up to 50MB with automatic cover detection" },
              { title: "Visual Editor", desc: "Edit text, images, and layouts with our intuitive canvas editor" },
              { title: "Template Library", desc: "20+ professional cover templates for business and academic use" },
              { title: "Page Management", desc: "Reorder, delete, or duplicate pages with simple drag & drop" },
              { title: "Cover Removal", desc: "Remove unwanted covers and title pages with one click" },
              { title: "Quality Export", desc: "Download high-quality PDFs with customizable compression" }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <div className="h-5 w-5 bg-blue-600 rounded"></div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
