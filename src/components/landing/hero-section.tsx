'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, FileText, Zap, Shield } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="text-center py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Professional PDF
          <span className="text-primary block">Cover & Page Editor</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Remove, replace, and edit PDF covers and pages with our intuitive browser-based tool. 
          Perfect for professionals, students, and businesses.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="text-lg px-8">
            Start Editing Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8">
            Watch Demo
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Process PDFs in seconds with our optimized engine
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">
              Files are processed locally and deleted after 24 hours
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Professional Quality</h3>
            <p className="text-sm text-muted-foreground">
              Maintain original PDF quality and formatting
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
