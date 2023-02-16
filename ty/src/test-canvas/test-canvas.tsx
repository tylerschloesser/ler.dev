import React, { useEffect, useRef, useState } from 'react'

interface Perf {
  frames: number
  last: number
}

export function TestCanvas() {
  const [fps, setFps] = useState(0)
  const perf = useRef<Perf>({ frames: 0, last: 0 })
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let stop = false

    function handleFrame(timestamp: number) {
      if (!canvas.current) {
        if (!stop) requestAnimationFrame(handleFrame)
        return
      }

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

      const context = canvas.current.getContext('2d')!
      context.clearRect(0, 0, canvas.current.width, canvas.current.height)

      context.strokeStyle = 'white'
      context.lineWidth = 2
      context.strokeRect(10, 10, 20, 20)

      if (!stop) requestAnimationFrame(handleFrame)
    }
    requestAnimationFrame(handleFrame)

    return () => {
      stop = true
    }
  }, [])

  return (
    <div>
      FPS: {fps}
      <canvas ref={canvas}></canvas>
    </div>
  )
}
