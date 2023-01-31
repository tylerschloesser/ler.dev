import { times } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { container } from 'webpack'
import { Engine, InitFn, RenderFn } from '../common/engine'

const init: InitFn = () => {}

const NUM_ROWS = 100
const NUM_COLS = 100

const grid = times(NUM_ROWS, () =>
  times(NUM_COLS, () => {
    const hue = 0
    const saturation = 50
    const lightness = 20 + Math.random() * 10
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }),
)

const render: RenderFn = ({ context, viewport }) => {
  context.clearRect(0, 0, viewport.w, viewport.h)

  const cellSize = Math.min(viewport.w / NUM_COLS, viewport.h / NUM_ROWS)

  for (let row = 0; row < NUM_ROWS; row++) {
    for (let col = 0; col < NUM_COLS; col++) {
      context.fillStyle = grid[row][col]
      const x = Math.round(col * cellSize)
      const y = Math.round(row * cellSize)
      const w = Math.ceil(cellSize)
      const h = Math.ceil(cellSize)
      context.fillRect(x, y, w, h)
    }
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
