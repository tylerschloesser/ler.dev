export interface State {
  board: boolean[][]
}

export const NUM_ROWS = 20
export const NUM_COLS = 10

export const state: State = (() => {
  const board: boolean[][] = new Array(NUM_ROWS).fill(null)
  for (let i = 0; i < board.length; i++) {
    board[i] = new Array(NUM_COLS).fill(false)
  }

  return {
    board,
  }
})()
