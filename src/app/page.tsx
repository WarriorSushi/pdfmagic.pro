'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePDFStore } from '@/stores/pdf-store'
import dynamic from 'next/dynamic'

const PDFUploader = dynamic(() => import('@/components/pdf/pdf-uploader').then(mod => ({ default: mod.PDFUploader })), { ssr: false })
const PDFViewer = dynamic(() => import('@/components/pdf/pdf-viewer').then(mod => ({ default: mod.PDFViewer })), { ssr: false })
const PageThumbnails = dynamic(() => import('@/components/pdf/page-thumbnails').then(mod => ({ default: mod.PageThumbnails })), { ssr: false })
const CoverEditor = dynamic(() => import('@/components/pdf/cover-editor').then(mod => ({ default: mod.CoverEditor })), { ssr: false })
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { PanelLeftClose, PanelLeftOpen, ArrowLeft, Zap, Shield, Award, Upload, Palette, Layers, Settings, Download } from 'lucide-react'

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
          <div className="container flex h-14 items-center px-2 lg:px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToUpload}
              className="mr-2 lg:mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Back to Upload</span>
              <span className="sm:hidden">Back</span>
            </Button>
            {editingMode === 'cover' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingMode('view')}
                className="ml-1 lg:ml-2"
              >
                <span className="hidden sm:inline">Exit Cover Editor</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            )}
            <h1 className="font-semibold text-sm lg:text-base truncate flex-1 mx-2">
              PDF Editor - {currentDocument.name}
            </h1>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main editing interface */}
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
          {/* Sidebar with thumbnails (hidden in cover edit mode and on mobile) */}
          {editingMode !== 'cover' && (
            <div className="hidden lg:block w-80 border-r bg-muted/10 flex-shrink-0">
              <PageThumbnails />
            </div>
          )}

          {/* Main viewer/editor */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {editingMode === 'cover' ? <CoverEditor /> : <PDFViewer />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header with theme toggle */}
      <header className="absolute top-0 right-0 p-4 z-50">
        <ThemeToggle />
      </header>
      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6">
            Professional PDF
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent block">Cover & Page Editor</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Remove, replace, and edit PDF covers and pages with our intuitive browser-based tool. 
            Perfect for professionals, students, and businesses.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={scrollToUpload}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Start Editing Now →
            </button>
            <button 
              onClick={() => alert('Demo coming soon!')}
              className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-md"
            >
              Watch Demo
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Lightning Fast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Process PDFs in seconds with our optimized engine
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Secure & Private</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Files are processed locally and deleted after 24 hours
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Professional Quality</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
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
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">Everything You Need</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful PDF editing tools designed for professionals who demand quality and efficiency
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Smart Upload", desc: "Drag & drop PDFs up to 50MB with automatic cover detection", icon: Upload, color: "blue" },
              { title: "Visual Editor", desc: "Edit text, images, and layouts with our intuitive canvas editor", icon: Palette, color: "purple" },
              { title: "Template Library", desc: "20+ professional cover templates for business and academic use", icon: Layers, color: "green" },
              { title: "Page Management", desc: "Reorder, delete, or duplicate pages with simple drag & drop", icon: Settings, color: "orange" },
              { title: "Cover Removal", desc: "Remove unwanted covers and title pages with one click", icon: Zap, color: "red" },
              { title: "Quality Export", desc: "Download high-quality PDFs with customizable compression", icon: Download, color: "indigo" }
            ].map((feature, index) => {
              const IconComponent = feature.icon
              const colorClasses = {
                blue: "from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 text-blue-600 dark:text-blue-300",
                purple: "from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 text-purple-600 dark:text-purple-300",
                green: "from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 text-green-600 dark:text-green-300",
                orange: "from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-700 text-orange-600 dark:text-orange-300",
                red: "from-red-100 to-red-200 dark:from-red-800 dark:to-red-700 text-red-600 dark:text-red-300",
                indigo: "from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-700 text-indigo-600 dark:text-indigo-300"
              }
              return (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses].split(' text-')[0]} flex items-center justify-center mb-4 shadow-md`}>
                    <IconComponent className={`h-5 w-5 ${colorClasses[feature.color as keyof typeof colorClasses].split('bg-gradient-to-br ')[1]}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
