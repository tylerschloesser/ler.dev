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

const render: RenderFn = () => {}

export function Tetris() {
  return <Engine init={init} render={render} />
}
