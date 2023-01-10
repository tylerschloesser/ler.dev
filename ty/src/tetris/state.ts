import { cloneDeep } from 'lodash'

export interface Piece {
  cells: [number, number][]
  lastDrop: number
}

export interface State {
  piece: Piece
  board: boolean[][]
}

export const NUM_ROWS = 20
export const NUM_COLS = 10

export function createRandomPiece(): Piece {
  return {
    cells: [[0, 3]],
    lastDrop: 0,
  }
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

export function updateState(timestamp: number) {
  if (state.piece.lastDrop === 0) {
    state.piece.lastDrop = timestamp
  }

  if (timestamp - state.piece.lastDrop > 1_000) {
    state.piece.lastDrop += 1_000

    const next: Piece = cloneDeep(state.piece)
    next.cells.forEach((cell) => {
      cell[0] = Math.min(cell[0] + 1, NUM_ROWS - 1)
    })

    // TODO fix case where piece hits bottom
    if (next.cells.some(([row, col]) => state.board[row][col])) {
      state.piece.cells.forEach(([row, col]) => {
        state.board[row][col] = true
      })
      state.piece = createRandomPiece()
    } else {
      state.piece = next
    }
  }
}
