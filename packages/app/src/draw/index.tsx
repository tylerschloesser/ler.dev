import {
  BatchDrawMessage,
  Grid,
  PushRequest,
  SyncRequestMessage,
  WebSocketMessage,
} from '@ler.dev/common'
import { times } from 'lodash'
import { useEffect } from 'react'
import { styled } from 'styled-components'
import { Engine, InitFn, RenderFn } from '../common/engine/index.js'
import { Vec2 } from '../common/vec2.js'
import { NUM_COLS, NUM_ROWS } from './config.js'

let webSocket: WebSocket | null = null

type Pointer = null | Vec2
let pointer: Pointer = null

// TODO update this on resize, not in render function
let cellSize = 0

// TODO handle out of bounds cells
function pointerToCell(pointer: Pointer, cellSize: number) {
  const x = Math.floor(pointer!.x / cellSize)
  const y = Math.floor(pointer!.y / cellSize)
  return new Vec2(x, y)
}

function generateGrid(getColor: () => string): Grid {
  return times(NUM_ROWS, () => times(NUM_COLS, getColor))
}

let grid = generateGrid(() => 'hsl(0, 0%, 100%)')

const batchDrawMessage: BatchDrawMessage = {
  action: 'batch-draw',
  payload: [],
}

const broadcastSetPixel = (cell: Vec2, color: string) => {
  batchDrawMessage.payload.push({ ...cell, color })
}

function setPixel(cell: Vec2, color: string, broadcast: boolean) {
  const { x: col, y: row } = cell
  if (row < 0 || row >= NUM_ROWS || col < 0 || col >= NUM_COLS) {
    console.error(`Invalid cell: ${cell.toString()}`)
    return
  }

  if (grid[row!]![col!] !== color) {
    grid[row!]![col!] = color
    if (broadcast) {
      broadcastSetPixel(cell, color)
    }
  }
}

const init: InitFn = ({ canvas, signal }) => {
  canvas.addEventListener(
    'pointermove',
    (e) => {
      const nextPointer = new Vec2(e.offsetX, e.offsetY)

      // if mouse, use pressure to detect mouse down
      if (e.pointerType === 'touch' || e.pressure > 0) {
        let v = nextPointer.sub(pointer || nextPointer)
        const dist = v.length()
        v = v.norm()

        // to compensate for potentially large distances between
        // pointer events, interpolate every [cellSize / 2] pixels
        for (let i = 0; i <= dist; i += cellSize / 2) {
          const interpolated = pointer!.add(v.mul(i))
          const cell = pointerToCell(interpolated, cellSize)
          setPixel(cell, 'white', true)
        }
      }

      pointer = nextPointer
    },
    { signal },
  )
}

const render: RenderFn = ({ context, viewport }) => {
  context.clearRect(0, 0, viewport.w, viewport.h)

  cellSize = Math.min(viewport.w / NUM_COLS, viewport.h / NUM_ROWS)

  for (let row = 0; row < NUM_ROWS; row++) {
    for (let col = 0; col < NUM_COLS; col++) {
      context.fillStyle = grid[row!]![col]!
      const x = col * cellSize
      const y = row * cellSize
      const w = cellSize
      const h = cellSize
      context.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h))
    }
  }

  if (pointer) {
    const { x, y } = pointerToCell(pointer, cellSize).mul(cellSize)
    const w = cellSize
    const h = cellSize
    context.strokeStyle = 'white'
    context.lineWidth = 2
    context.strokeRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h))
  }
}

const Container = styled.div`
  box-sizing: border-box;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  container-type: size;
`

const EngineContainer = styled.div`
  --size: calc(min(100cqw, 100cqh));
  height: var(--size);
  width: var(--size);
`

enum WebSocketReadyState {
  Connecting = 0,
  Open = 1,
  Closing = 2,
  Closed = 3,
}

async function push() {
  const message: PushRequest = {
    action: 'push',
    payload: {
      grid,
    },
  }
  webSocket?.send(JSON.stringify(message))
}

export function Draw() {
  useEffect(() => {
    webSocket = new WebSocket('wss://draw-api.staging.ty.ler.dev')
    webSocket.addEventListener('open', () => {
      console.log('web socket open')
      const message: SyncRequestMessage = {
        action: 'sync-request',
        payload: null,
      }
      webSocket?.send(JSON.stringify(message))
    })
    webSocket.addEventListener('message', (ev) => {
      let message: WebSocketMessage
      try {
        message = WebSocketMessage.parse(JSON.parse(ev.data))
      } catch (e) {
        console.log("can't parse websocket message, ignoring...")
        return
      }

      switch (message.action) {
        case 'sync-response': {
          if (message.payload.grid) {
            grid = message.payload.grid
          } else {
            grid = generateGrid(() => {
              const hue = 0
              const saturation = 50
              const lightness = 20 + Math.random() * 10
              return `hsl(${hue}, ${saturation}%, ${lightness.toFixed(1)}%)`
            })
            push()
          }
          break
        }
        case 'batch-draw': {
          message.payload.forEach(({ x, y, color }) => {
            setPixel(new Vec2(x, y), color, false)
          })
          break
        }
      }
    })
    let interval = window.setInterval(() => {
      if (
        webSocket?.readyState === WebSocketReadyState.Open &&
        batchDrawMessage.payload.length
      ) {
        const copy = { ...batchDrawMessage }
        batchDrawMessage.payload = []
        webSocket.send(JSON.stringify(copy))
      }
    }, 500)
    return () => {
      webSocket?.close()
      window.clearInterval(interval)
    }
  }, [])
  return (
    <Container>
      <EngineContainer>
        <Engine init={init} render={render} />
      </EngineContainer>
    </Container>
  )
}
