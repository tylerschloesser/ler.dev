import React, { useEffect, useState } from 'react'

function initCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')!
  const w = window.innerWidth
  const h = window.innerHeight
  context.clearRect(0, 0, w, h)
  context.fillStyle = 'grey'
  context.fillRect(0, 0, w, h)
}

export function Games() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  useEffect(() => {
    canvas && initCanvas(canvas)
  }, [canvas])
  return (
    <div>
      <canvas
        ref={setCanvas}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  )
}
