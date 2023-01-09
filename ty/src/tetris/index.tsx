import React from 'react'
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

  context.translate(10, 10)
  context.strokeStyle = 'white'
  context.beginPath()
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const x = col * 20
      const y = row * 20
      const w = 20
      const h = 20
      context.strokeRect(x, y, w, h)
    }
  }
  context.closePath()
  context.resetTransform()
}

export function Tetris() {
  return <Engine init={init} render={render} />
}
