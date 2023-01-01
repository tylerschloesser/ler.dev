import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

function init(canvas: HTMLCanvasElement) {
  {
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
  }
  const context = canvas.getContext('2d')!

  {
    context.fillStyle = 'hsl(0, 0%, 80%)'

    const translate = {
      x: canvas.width / 2,
      y: canvas.height / 2,
    }

    context.moveTo(translate.x + 0, translate.y + 0)

    const radius = Math.min(canvas.width, canvas.height) * 0.1

    const parts = 10
    for (let i = 0; i <= parts; i++) {
      const theta = ((Math.PI * 2) / parts) * i
      const x = Math.sin(theta) * radius
      const y = Math.cos(theta) * radius
      context.lineTo(translate.x + x, translate.y + y)
    }
    context.fill()
  }
}

const Canvas = styled.canvas`
  display: block;
  height: 100%;
  width: 100%;
`

export function Blob() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
  useEffect(() => {
    canvas && init(canvas)
  }, [canvas])
  return <Canvas ref={setCanvas} />
}
