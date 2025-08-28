# PDFstripper.com

A professional web-based PDF manipulation tool for removing, replacing, and editing PDF covers and pages.

## Features

- **Smart PDF Upload**: Drag & drop PDFs up to 50MB with automatic cover detection
- **Visual Editor**: Edit text, images, and layouts with intuitive canvas editor
- **Template Library**: 20+ professional cover templates for business and academic use
- **Page Management**: Reorder, delete, or duplicate pages with drag & drop
- **Cover Removal**: Remove unwanted covers and title pages with one click
- **Quality Export**: Download high-quality PDFs with customizable compression

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **PDF Processing**: PDF.js, PDF-lib, Fabric.js
- **State Management**: Zustand
- **File Handling**: React-Dropzone

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Upload a PDF file using drag & drop or file browser
2. View page thumbnails and automatically detected covers
3. Edit covers using the canvas editor or choose from templates
4. Manage pages (delete, reorder, mark as cover)
5. Export your edited PDF with quality settings

## Architecture

- `/src/app/` - Next.js 14 App Router pages
- `/src/components/` - Reusable UI components
- `/src/lib/` - Utility functions and PDF processing
- `/src/stores/` - Zustand state management
- `/src/components/ui/` - shadcn/ui component library
