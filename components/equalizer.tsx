"use client"

import { useEffect, useRef } from "react"

interface EqualizerProps {
  analyser: AnalyserNode | null
  isPlaying: boolean
  color?: string
  strokeWidthMultiplier?: number
}

export default function Equalizer({ analyser, isPlaying, color = "255, 255, 255", strokeWidthMultiplier = 1 }: EqualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match display size for sharpness
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      // Only update if dimensions changed to avoid flickering/clearing
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        // Scaling needs to be reset after resize
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Configuration for the visual style
    const SMOOTHING = 0.8
    const LINE_WIDTH = 3 * strokeWidthMultiplier
    const GLOW_BLUR = 10
    const BASE_COLOR = color

    if (!analyser) {
      return
    }

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      analyser.getByteFrequencyData(dataArray)
      
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      
      ctx.clearRect(0, 0, width, height)

      // BASS DETECTION for Aggressive Glow
      // Calculate average energy of the lowest frequencies (first 10 bins)
      let bassEnergy = 0
      for (let i = 0; i < 10; i++) {
        bassEnergy += dataArray[i]
      }
      bassEnergy = bassEnergy / 10 / 255.0 // Normalize 0-1

      // Dynamic variables based on intensity
      // If bass > 0.55, we start boosting effects aggressively
      const isBassHit = bassEnergy > 0.55
      const intensity = isBassHit ? (bassEnergy - 0.55) / 0.45 : 0 // 0 to 1 scaling during hits
      
      const currentLineWidth = LINE_WIDTH + 1 + (intensity * 6) // Thicker line
      const currentBlur = GLOW_BLUR + (intensity * 60) // Massive blur increase (up to 70px)
      const currentOpacity = 0.6 + (intensity * 0.4) // Opacity up to 1.0
      
      // Styling for the glowing line
      ctx.lineWidth = currentLineWidth
      ctx.shadowBlur = currentBlur
      // If hitting hard, use pure white with high opacity
      ctx.shadowColor = `rgba(${BASE_COLOR}, ${currentOpacity})`
      ctx.strokeStyle = `rgba(${BASE_COLOR}, ${0.9 + (intensity * 0.1)})`
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // We'll focus on the data that matters (usually the first half is most active)
      // Visualizing only the punchy bottom 20% of spectrum for maximum movement
      const relevantLength = Math.floor(bufferLength * 0.2) 
      const sliceWidth = width / (relevantLength - 1)
      
      ctx.beginPath()
      
      const points: {x: number, y: number}[] = []
      
      let x = 0
      for (let i = 0; i < relevantLength; i++) {
        const v = dataArray[i] / 255.0
        
        // Smoother, less aggressive boost since container is huge
        // Lower power and multiplier for a more controlled "background" wave
        const boostedV = Math.pow(v, 1.5) * 1.5
        
        // Maximum usage: 25% of height
        // Since the canvas is now full height of the player, 25% is still distinct
        // but won't dominate the UI or look too frantic.
        const yOffset = Math.min(boostedV * (height * 0.25), height * 0.25)
        
        points.push({ x, y: (height / 2) - yOffset })
        x += sliceWidth
      }

      if (points.length > 0) {
        // Draw the main line
        ctx.moveTo(points[0].x, points[0].y)
        
        // Spline interpolation
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2
          const yc = (points[i].y + points[i + 1].y) / 2
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
      }
      
      ctx.stroke()
      
      // AGGRESSIVE OVERDRAW: If bass is hitting hard, draw again to stack the glow
      if (intensity > 0.5) {
          ctx.lineWidth = currentLineWidth * 0.8
          ctx.stroke()
          if (intensity > 0.8) {
              ctx.lineWidth = currentLineWidth * 0.6
              ctx.globalAlpha = 0.5
              ctx.stroke()
              ctx.globalAlpha = 1.0
          }
      }

      // Reflection Lines (Multiple layers for depth)
      // Scaled 1:1 max to match the aggressive main wave without clipping
      const reflectionLayers = [
        { scale: 1.0, alpha: 0.2 + (intensity * 0.2) },  // Reflections get brighter too
        { scale: 0.9, alpha: 0.1 + (intensity * 0.1) },  
        { scale: 0.7, alpha: 0.05 + (intensity * 0.1) }, 
        { scale: 0.5, alpha: 0.15 + (intensity * 0.1) }  
      ]

      ctx.shadowBlur = intensity * 15 // Add some glow to reflections on bass hits 
      const center = height / 2

      reflectionLayers.forEach(layer => {
        ctx.beginPath()
        ctx.globalAlpha = layer.alpha

        if (points.length > 0) {
          // Calculate mirrored and scaled Y position
          // y_mirror = center + (distance_from_center * scale)
          // distance_from_center = center - point.y
          
          const getMirrorY = (y: number) => center + (center - y) * layer.scale

          ctx.moveTo(points[0].x, getMirrorY(points[0].y))

          for (let i = 0; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2
            const yc = (points[i].y + points[i + 1].y) / 2
            
            const ctrlY = getMirrorY(points[i].y)
            const anchorY = getMirrorY(yc)

            ctx.quadraticCurveTo(points[i].x, ctrlY, xc, anchorY)
          }
          
          ctx.lineTo(points[points.length - 1].x, getMirrorY(points[points.length - 1].y))
        }
        ctx.stroke()
      })
      
      ctx.globalAlpha = 1.0


      requestRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', updateSize)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [analyser])

  return (
    <div 
      className={`absolute inset-0 w-full h-full pointer-events-none -z-0 mix-blend-screen transition-opacity duration-[1500ms] ${
        isPlaying ? "opacity-50" : "opacity-0"
      }`}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
        style={{
          willChange: "transform",
          // Feathered Edges using CSS Mask
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
        }}
      />
    </div>
  )
}
