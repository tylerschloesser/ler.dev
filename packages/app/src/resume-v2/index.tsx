import { useEffect, useRef } from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

// @refresh reset
//
export function ResumeV2() {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    const size = new Vec2(
      window.innerWidth,
      window.innerHeight,
    ).mul(window.devicePixelRatio)

    const worker = new Worker(
      new URL('./worker.ts', import.meta.url),
      {
        type: 'module',
      },
    )

    const offscreen = canvas.transferControlToOffscreen()

    worker.postMessage({ canvas: offscreen, size }, [
      offscreen,
    ])

    invariant(container.current)
    container.current.appendChild(canvas)

    return () => {
      invariant(container.current)
      container.current.removeChild(canvas)
      worker.terminate()
    }
  }, [])

  return <div ref={container} />
}
