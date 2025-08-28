'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Show tooltip for first 5 seconds
    setShowTooltip(true)
    const timer = setTimeout(() => {
      setShowTooltip(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="relative bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 shadow-md hover:shadow-lg transition-all duration-300 rounded-full w-12 h-12"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] text-slate-700 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      
      {/* Tooltip Modal */}
      {showTooltip && (
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap animate-pulse">
          Night/Day Mode
          <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-slate-900 dark:border-l-white border-y-[6px] border-y-transparent"></div>
        </div>
      )}
    </div>
  )
}
