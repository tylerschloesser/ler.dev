import React, { useEffect, useRef, useState } from 'react'

interface Perf {
  frames: number
  last: number
}

export function TestCanvas() {
  const [fps, setFps] = useState(0)
  const perf = useRef<Perf>({ frames: 0, last: 0 })
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvas) return
    let stop = false

    const context = canvas.getContext('2d')!

    function handleFrame(timestamp: number) {
      if (
        Math.floor(timestamp / 1000) !== Math.floor(perf.current.last / 1000)
      ) {
        setFps(perf.current.frames)
        perf.current = {
          frames: 1,
          last: Math.floor(timestamp / 1000) * 1000,
        }
      } else {
        perf.current.frames++
      }

      context.clearRect(0, 0, canvas!.width, canvas!.height)

      context.strokeStyle = 'white'
      context.lineWidth = 2
      context.strokeRect(10, 10, 20, 20)

      if (!stop) requestAnimationFrame(handleFrame)
    }
    requestAnimationFrame(handleFrame)

    return () => {
      stop = true
    }
  }, [canvas])

  return (
    <div>
      FPS: {fps}
      <canvas ref={setCanvas}></canvas>
    </div>
  )
}
