import { cloneDeep } from 'lodash'

type Cell = [number, number]

export interface Piece {
  cells: Cell[]
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

function isValid(piece: Piece): boolean {
  return piece.cells.every(([row, col]) => {
    if (row < 0 || row >= NUM_ROWS || col < 0 || col >= NUM_COLS) {
      return false
    }
    if (state.board[row][col] === true) {
      return false
    }
    return true
  })
}

export enum Input {
  MoveLeft = 'move-left',
  MoveRight = 'move-right',
  MoveDown = 'move-down',
}

function movePiece(direction: 'left' | 'right' | 'down') {
  let [dRow, dCol] = {
    left: [0, -1],
    right: [0, 1],
    down: [1, 0],
  }[direction]
  const next = cloneDeep(state.piece)
  next.cells = next.cells.map(([row, col]) => [row + dRow, col + dCol])
  if (isValid(next)) {
    state.piece = next
  } else if (direction === 'down') {
    state.piece.cells.forEach(([row, col]) => {
      state.board[row][col] = true
    })
    state.piece = createRandomPiece()
  }
}

export function handleInput(input: Input) {
  switch (input) {
    case Input.MoveLeft:
      movePiece('left')
      break
    case Input.MoveRight:
      movePiece('right')
      break
    case Input.MoveDown: {
      movePiece('down')
      break
    }
  }
}

export function updateState(timestamp: number) {
  if (state.piece.lastDrop === 0) {
    state.piece.lastDrop = timestamp
  }

  if (timestamp - state.piece.lastDrop > 1_000) {
    state.piece.lastDrop += 1_000
    movePiece('down')
  }
}
