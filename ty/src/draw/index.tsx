import { times } from 'lodash'
import React from 'react'
import styled from 'styled-components'
import { Engine, InitFn, RenderFn } from '../common/engine'
import { Vec2 } from '../common/vec2'

const NUM_ROWS = 50
const NUM_COLS = 50
let pointer: null | Vec2 = null

const grid = times(NUM_ROWS, () =>
  times(NUM_COLS, () => {
    const hue = 0
    const saturation = 50
    const lightness = 20 + Math.random() * 10
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }),
)

const init: InitFn = ({ canvas, signal }) => {
  canvas.addEventListener(
    'pointermove',
    (e) => {
      pointer = new Vec2(e.offsetX, e.offsetY)
    },
    { signal },
  )
}

const render: RenderFn = ({ context, viewport }) => {
  context.clearRect(0, 0, viewport.w, viewport.h)

  const cellSize = Math.min(viewport.w / NUM_COLS, viewport.h / NUM_ROWS)

  for (let row = 0; row < NUM_ROWS; row++) {
    for (let col = 0; col < NUM_COLS; col++) {
      context.fillStyle = grid[row][col]
      const x = col * cellSize
      const y = row * cellSize
      const w = cellSize
      const h = cellSize
      context.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h))
    }
  }

  if (pointer) {
    const x = Math.floor(pointer.x / cellSize) * cellSize
    const y = Math.floor(pointer.y / cellSize) * cellSize
    const w = cellSize
    const h = cellSize
    context.strokeStyle = 'white'
    context.lineWidth = 1
    context.strokeRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h))
  }
}

const Container = styled.div`
  box-sizing: border-box;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  container-type: size;
`

const EngineContainer = styled.div`
  --size: calc(min(100cqw, 100cqh));
  height: var(--size);
  width: var(--size);
`

export function Draw() {
  return (
    <Container>
      <EngineContainer>
        <Engine init={init} render={render} />
      </EngineContainer>
    </Container>
  )
}
