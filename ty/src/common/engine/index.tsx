import React, { useEffect, useState } from 'react'

export type InitFn = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
) => { cleanup(): void }

export interface EngineProps {
  init: InitFn
}

export function Engine({ init }: EngineProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  useEffect(() => {
    let cleanup: () => void | undefined
    if (canvas) {
      const context = canvas.getContext('2d')!
      cleanup = init(canvas, context).cleanup
    }

    // prevent scroll
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      cleanup?.()
    }
  }, [canvas])

  return (
    <div>
      <canvas ref={setCanvas} />
    </div>
  )
}
