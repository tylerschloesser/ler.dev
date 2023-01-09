import React from 'react'

interface State {
  board: boolean[][]
}

const NUM_ROWS = 20
const NUM_COLS = 10

function init() {
  const board: boolean[][] = new Array(NUM_ROWS).fill(null)
  for (let i = 0; i < board.length; i++) {
    board[i] = new Array(NUM_COLS).fill(false)
  }

  const state: State = {
    board,
  }
  console.log(state)
}

export function Tetris() {
  init()
  return <>todo</>
}
