import { useEffect, useRef } from 'react'
import invariant from 'tiny-invariant'
import {
  InitMessage,
  MessageType,
  ViewportMessage,
} from './message'
import { Vec2 } from './vec2'

function getViewport() {
  return new Vec2(window.innerWidth, window.innerHeight)
}

export function ResumeV2() {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const canvas = document.createElement('canvas')
    const viewport = getViewport()

    canvas.style.width = '100dvw'
    canvas.style.height = '100dvh'

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

    const controller = new AbortController()
    const { signal } = controller

    window.addEventListener(
      'resize',
      () => {
        worker.postMessage({
          type: MessageType.enum.Viewport,
          viewport: getViewport(),
        } satisfies ViewportMessage)
      },
      { signal },
    )

    return () => {
      invariant(container.current)
      container.current.removeChild(canvas)
      worker.terminate()
      controller.abort()
    }
  }, [])

  return <div ref={container} />
}
