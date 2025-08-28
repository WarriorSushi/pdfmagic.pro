'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Edit3, Download, Layers, Palette, Trash2 } from 'lucide-react'

const features = [
  {
    icon: Upload,
    title: "Smart Upload",
    description: "Drag & drop PDFs up to 50MB with automatic cover detection"
  },
  {
    icon: Edit3,
    title: "Visual Editor",
    description: "Edit text, images, and layouts with our intuitive canvas editor"
  },
  {
    icon: Palette,
    title: "Template Library",
    description: "20+ professional cover templates for business and academic use"
  },
  {
    icon: Layers,
    title: "Page Management",
    description: "Reorder, delete, or duplicate pages with simple drag & drop"
  },
  {
    icon: Trash2,
    title: "Cover Removal",
    description: "Remove unwanted covers and title pages with one click"
  },
  {
    icon: Download,
    title: "Quality Export",
    description: "Download high-quality PDFs with customizable compression"
  }
]

export function FeatureHighlights() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Powerful PDF editing tools designed for professionals who demand quality and efficiency
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
