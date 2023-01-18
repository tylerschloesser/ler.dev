import { cloneDeep, random } from 'lodash'

type Cell = [number, number]

export enum Input {
  MoveLeft = 'move-left',
  MoveRight = 'move-right',
  MoveDown = 'move-down',
  Rotate = 'rotate',
}

export enum Color {
  Purple = 'hsl(275, 81.6%, 51%)',
  Green = 'hsl(106, 82.1%, 60.6%)',
  Red = 'hsl(5, 73.9%, 49.6%)',
  Blue = 'hsl(240, 100%, 45.5%)',
  Orange = 'hsl(30, 73.8%, 53.5%)',
  Yellow = 'hsl(55, 90.3%, 63.5%)',
  Cyan = 'hsl(181, 82.4%, 68.8%)',
}

export interface Piece {
  cells: Cell[]
  color: Color
  position: { row: number; col: number }
  lastDrop: number
}

export interface State {
  piece: Piece
  board: (Color | null)[][]
  hold: {
    [Input.MoveDown]: number | null
    [Input.MoveLeft]: number | null
    [Input.MoveRight]: number | null
  }
}

export const NUM_ROWS = 20
export const NUM_COLS = 10

const PIECES: { cells: Cell[]; color: Color }[] = [
  // ▢▢▢
  //  ▢
  {
    color: Color.Purple,
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 1],
    ],
  },
  // ▢▢▢
  //   ▢
  {
    color: Color.Blue,
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
  },
  // ▢▢▢
  // ▢
  {
    color: Color.Orange,
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
    ],
  },
  //  ▢▢
  // ▢▢
  {
    color: Color.Yellow,
    cells: [
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
    ],
  },
  // ▢▢
  //  ▢▢
  {
    color: Color.Red,
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  },
  // ▢▢▢▢
  {
    color: Color.Cyan,
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
  },
]

export function createRandomPiece(): Piece {
  const piece: Piece = {
    ...cloneDeep(PIECES[random(PIECES.length - 1)]),
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
  const board: null[][] = new Array(NUM_ROWS).fill(null)
  for (let i = 0; i < board.length; i++) {
    board[i] = new Array(NUM_COLS).fill(null)
  }
  return board
}

export const state: State = (() => {
  return {
    piece: createRandomPiece(),
    board: createEmptyBoard(),
    hold: {
      [Input.MoveDown]: null,
      [Input.MoveLeft]: null,
      [Input.MoveRight]: null,
    },
  }
})()

function isValid(piece: Piece): boolean {
  return piece.cells
    .map(([row, col]) => [row + piece.position.row, col + piece.position.col])
    .every(([row, col]) => {
      if (row < 0 || row >= NUM_ROWS || col < 0 || col >= NUM_COLS) {
        return false
      }
      if (state.board[row][col]) {
        return false
      }
      return true
    })
}

function checkBoard() {
  const next: (Color | null)[][] = []
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
        state.board[row][col] = state.piece.color
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

export function handleInput(input: Input, type: 'keyup' | 'keydown') {
  switch (input) {
    case Input.MoveLeft:
    case Input.MoveRight:
    case Input.MoveDown: {
      if (type === 'keyup') {
        state.hold[input] = null
      } else {
        // keydown
        state.hold[input] = state.hold[input] ?? 0
      }
      break
    }
    case Input.Rotate: {
      if (type === 'keydown') {
        rotatePiece()
      }
      break
    }
  }
}

export function updateState({ elapsed }: { elapsed: number }) {
  state.piece.lastDrop += elapsed

  // TODO refactor to not need this
  let movedDown = false

  Object.entries(state.hold).forEach(([input, value]) => {
    if (value === null) {
      return
    }

    const next = value + elapsed

    // move piece immediately, then wait Xms before moving every Yms
    // aka manual debounce
    if (input === Input.MoveLeft || input === Input.MoveRight) {
      const direction = input === Input.MoveLeft ? 'left' : 'right'
      if (value === 0) {
        movePiece(direction)
      } else if (
        next >= 200 &&
        Math.floor(value / 50) !== Math.floor(next / 50)
      ) {
        movePiece(direction)
      }
    } else if (input === Input.MoveDown) {
      if (Math.floor(value / 50) !== Math.floor(next / 50)) {
        movePiece('down')
        movedDown = true
      }
    }

    // TODO remove any hack
    ;(state.hold as any)[input] = next
  })

  if (state.piece.lastDrop >= 1_000) {
    state.piece.lastDrop -= 1_000
    if (!movedDown) {
      movePiece('down')
      movedDown = true
    }
  }
}
