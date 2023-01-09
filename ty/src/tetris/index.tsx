import React from 'react'
import styled from 'styled-components'
import { Engine, InitFn, RenderFn } from '../common/engine'

interface State {
  board: boolean[][]
}

const NUM_ROWS = 20
const NUM_COLS = 10

const state: State = (() => {
  const board: boolean[][] = new Array(NUM_ROWS).fill(null)
  for (let i = 0; i < board.length; i++) {
    board[i] = new Array(NUM_COLS).fill(false)
  }

  return {
    board,
  }
})()

const init: InitFn = () => {
  console.log(state)
}

const render: RenderFn = ({ context, viewport }) => {
  const { board } = state

  context.clearRect(0, 0, viewport.w, viewport.h)

  context.translate(10, 10)
  context.strokeStyle = 'white'
  context.beginPath()

  const size = Math.min(viewport.w / NUM_COLS, viewport.h / NUM_ROWS)

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const x = col * size
      const y = row * size
      const w = size
      const h = size
      context.strokeRect(x, y, w, h)
    }
  }
  context.closePath()
  context.resetTransform()
}

const Container = styled.div`
  height: 100vh;
`

export function Tetris() {
  return (
    <Container>
      <Engine init={init} render={render} />
    </Container>
  )
}
