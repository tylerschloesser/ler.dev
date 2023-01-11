import { cloneDeep, random } from 'lodash'

type Cell = [number, number]

export interface Piece {
  cells: Cell[]
  position: { row: number; col: number }
  lastDrop: number
}

export interface State {
  piece: Piece
  board: boolean[][]
}

export const NUM_ROWS = 20
export const NUM_COLS = 10

const PIECES: Cell[][] = [
  // ▢▢▢
  //  ▢
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 1],
  ],
  // ▢▢▢
  //   ▢
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
  ],
  // ▢▢▢
  // ▢
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
  ],
  //  ▢▢
  // ▢▢
  [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
  ],
  // ▢▢
  //  ▢▢
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ],
  // ▢▢▢▢
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
]

export function createRandomPiece(): Piece {
  const piece: Piece = {
    cells: cloneDeep(PIECES[random(PIECES.length - 1)]),
    position: {
      row: 0,
      // move to center, assuming piece is either 3 or 4 cols
      col: NUM_COLS / 2 - 2,
    },
    lastDrop: 0,
  }
  return piece
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
  return piece.cells
    .map(([row, col]) => [row + piece.position.row, col + piece.position.col])
    .every(([row, col]) => {
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
  Rotate = 'rotate',
}

function checkBoard() {
  const next: boolean[][] = []
  for (let row = 0; row < NUM_ROWS; row++) {
    if (state.board[row].every((cell) => cell)) {
      next.unshift(new Array(NUM_COLS).fill(false))
    } else {
      next.push(state.board[row])
    }
  }
  state.board = next
}

function movePiece(direction: 'left' | 'right' | 'down') {
  let [dRow, dCol] = {
    left: [0, -1],
    right: [0, 1],
    down: [1, 0],
  }[direction]

  const next = cloneDeep(state.piece)
  next.position.col += dCol
  next.position.row += dRow

  if (isValid(next)) {
    state.piece = next
  } else if (direction === 'down') {
    state.piece.cells
      .map(([row, col]) => [
        row + state.piece.position.row,
        col + state.piece.position.col,
      ])
      .forEach(([row, col]) => {
        state.board[row][col] = true
      })
    checkBoard()
    state.piece = createRandomPiece()
  }
}

function rotatePiece() {
  const next = cloneDeep(state.piece)
  next.cells = next.cells.map(([row, col]) => [col, 2 - row])
  if (isValid(next)) {
    state.piece = next
  } else {
    // TODO try to move the piece so we can rotate?
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
    case Input.Rotate: {
      rotatePiece()
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
