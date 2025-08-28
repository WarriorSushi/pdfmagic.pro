import { useEffect, useRef } from 'react'

interface UsePinchZoomProps {
  onZoom: (scale: number) => void
  minZoom?: number
  maxZoom?: number
  initialZoom?: number
}

export function usePinchZoom({ 
  onZoom, 
  minZoom = 0.5, 
  maxZoom = 3, 
  initialZoom = 1 
}: UsePinchZoomProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const lastZoom = useRef(initialZoom)
  const isZooming = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let initialDistance = 0
    let initialScale = lastZoom.current

    const getDistance = (touches: TouchList) => {
      if (touches.length < 2) return 0
      const touch1 = touches[0]
      const touch2 = touches[1]
      return Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        isZooming.current = true
        initialDistance = getDistance(e.touches)
        initialScale = lastZoom.current
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isZooming.current) {
        e.preventDefault()
        const currentDistance = getDistance(e.touches)
        if (initialDistance > 0) {
          const scale = initialScale * (currentDistance / initialDistance)
          const clampedScale = Math.min(Math.max(scale, minZoom), maxZoom)
          lastZoom.current = clampedScale
          onZoom(clampedScale)
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isZooming.current = false
      }
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onZoom, minZoom, maxZoom])

  return elementRef
}
