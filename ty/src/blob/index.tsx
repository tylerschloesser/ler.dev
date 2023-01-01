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
    const x = canvas.width / 2
    const y = canvas.height / 2
    context.fillStyle = 'hsl(0, 0%, 80%)'
    context.arc(
      x,
      y,
      Math.min(canvas.width, canvas.height) * 0.1,
      0,
      Math.PI * 2,
    )
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
