import React, { useEffect, useState } from 'react'
import { initInput, initResizeObserver } from './input'
import { buildRender } from './render'
import { addTargetPair, state, viewport } from './state'

// IDEAS
// two balls, input controls both balls

function initCanvas(canvas: HTMLCanvasElement) {
  canvas.width = viewport.w
  canvas.height = viewport.h

  const context = canvas.getContext('2d')!

  initInput(canvas)

  window.requestAnimationFrame(buildRender(context))
}

const TARGET_PAIRS = 5

function initTargets() {
  for (let i = 0; i < TARGET_PAIRS; i++) {
    addTargetPair(state.targets)
  }
}

export function Games() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  useEffect(() => {
    let cleanup: () => void | undefined
    if (canvas) {
      initTargets()
      initCanvas(canvas)
      cleanup = initResizeObserver(canvas)
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
