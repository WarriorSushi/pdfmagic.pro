'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { usePDFStore } from '@/stores/pdf-store'
import { processPDFFile } from '@/lib/pdf-utils'

export function PDFUploader() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { setDocument, setProcessing } = usePDFStore()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploadStatus('uploading')
    setProcessing(true)
    
    try {
      const document = await processPDFFile(file)
      setDocument(document)
      setUploadStatus('success')
    } catch (error) {
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process PDF')
    } finally {
      setProcessing(false)
    }
  }, [setDocument, setProcessing])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  })

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
            ${uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {uploadStatus === 'idle' && (
            <>
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {isDragActive ? 'Drop your PDF here' : 'Upload your PDF'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop a PDF file here, or click to browse
              </p>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Maximum file size: 50MB • Supports password-protected PDFs
              </p>
            </>
          )}
          
          {uploadStatus === 'uploading' && (
            <>
              <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
              <h3 className="text-lg font-semibold mb-2">Processing PDF...</h3>
              <p className="text-muted-foreground">
                Analyzing pages and generating thumbnails
              </p>
            </>
          )}
          
          {uploadStatus === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2 text-green-700">PDF Uploaded Successfully!</h3>
              <p className="text-muted-foreground">
                Your PDF has been processed and is ready for editing
              </p>
            </>
          )}
          
          {uploadStatus === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2 text-red-700">Upload Failed</h3>
              <p className="text-red-600 mb-4">{errorMessage}</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setUploadStatus('idle')
                  setErrorMessage('')
                }}
              >
                Try Again
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
