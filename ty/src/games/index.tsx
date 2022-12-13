import React, { useEffect, useState } from 'react'

function initCanvas(canvas: HTMLCanvasElement) {
  console.log('todo init canvas')
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
