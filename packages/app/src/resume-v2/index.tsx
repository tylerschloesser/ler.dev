import { useEffect, useRef } from 'react'
import invariant from 'tiny-invariant'
import { InitMessage, MessageType } from './message'
import { Vec2 } from './vec2'

export function ResumeV2() {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.width = '100dvw'
    canvas.style.height = '100dvh'

    const viewport = new Vec2(
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

    worker.postMessage(
      {
        type: MessageType.enum.Init,
        canvas: offscreen,
        viewport,
      } satisfies InitMessage,
      [offscreen],
    )

    invariant(container.current)
    container.current.appendChild(canvas)

    const ro = new ResizeObserver(() => {
      invariant(container.current)
    })
    ro.observe(canvas)

    return () => {
      invariant(container.current)
      container.current.removeChild(canvas)
      worker.terminate()
      ro.disconnect()
    }
  }, [])

  return <div ref={container} />
}
