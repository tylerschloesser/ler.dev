import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

export function Canvas() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [viewport, setViewport] = useState<Vec2 | null>(
    null,
  )
  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      const { contentRect: rect } = entry
      setViewport(new Vec2(rect.width, rect.height))
    })
    invariant(canvas.current)
    ro.observe(canvas.current)
    return () => {
      ro.disconnect()
    }
  }, [])
  useEffect(() => {
    if (!viewport || !canvas.current) return
    console.log(viewport)
  }, [viewport])
  return <canvas ref={canvas} className="w-full h-full" />
}
