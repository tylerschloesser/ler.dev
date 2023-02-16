import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

interface Perf {
  frames: number
  last: number
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
`

export function TestCanvas() {
  const [fps, setFps] = useState(0)
  const perf = useRef<Perf>({ frames: 0, last: 0 })
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvas) return

    const rect = document.body.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

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
      for (let i = 0; i < 100; i++) {
        const w = 10 + Math.floor(Math.random() * 20)
        const h = 10 + Math.floor(Math.random() * 20)
        const x = Math.random() * (canvas!.width - w)
        const y = Math.random() * (canvas!.height - h)
        context.strokeRect(x, y, w, h)
      }

      if (!stop) requestAnimationFrame(handleFrame)
    }
    requestAnimationFrame(handleFrame)

    return () => {
      stop = true
    }
  }, [canvas])

  return (
    <div>
      <Overlay>FPS: {fps}</Overlay>
      <canvas ref={setCanvas}></canvas>
    </div>
  )
}
