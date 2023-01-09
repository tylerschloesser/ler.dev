type Piece = [number, number][]

export interface State {
  piece: Piece
  board: boolean[][]
}

export const NUM_ROWS = 20
export const NUM_COLS = 10

function createRandomPiece(): Piece {
  return [[0, 3]]
}

function createEmptyBoard() {
  const board: boolean[][] = new Array(NUM_ROWS).fill(null)
  for (let i = 0; i < board.length; i++) {
    board[i] = new Array(NUM_COLS).fill(false)
  }
  return board
}

export const state: State = (() => {
  return {
    piece: createRandomPiece(),
    board: createEmptyBoard(),
  }
})()
