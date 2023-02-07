import { DrawRequest } from 'common'
import { times } from 'lodash'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { Engine, InitFn, RenderFn } from '../common/engine'
import { Vec2 } from '../common/vec2'

let webSocket: WebSocket | null = null

type Pointer = null | Vec2
const NUM_ROWS = 50
const NUM_COLS = 50
let pointer: Pointer = null

// TODO update this on resize, not in render function
let cellSize = 0

// TODO handle out of bounds cells
function pointerToCell(pointer: Pointer, cellSize: number) {
  const x = Math.floor(pointer!.x / cellSize)
  const y = Math.floor(pointer!.y / cellSize)
  return new Vec2(x, y)
}

const grid = times(NUM_ROWS, () =>
  times(NUM_COLS, () => {
    const hue = 0
    const saturation = 50
    const lightness = 20 + Math.random() * 10
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }),
)

let broadcastQueue: DrawRequest['payload']['cells'] = []

const broadcastSetPixel = (cell: Vec2, color: string) => {
  broadcastQueue.push({ ...cell, color })
  // const payload = JSON.stringify({ cell, color })
  // console.log(payload)
  // const drawRequest: DrawRequest = {
  //   action: 'draw',
  //   payload: {
  //     cells:
  //   }
  // }
}

function setPixel(cell: Vec2, color: string) {
  const { x: col, y: row } = cell
  if (row < 0 || row >= NUM_ROWS || col < 0 || col >= NUM_COLS) {
    console.error(`Invalid cell: ${cell.toString()}`)
    return
  }

  if (grid[row][col] !== color) {
    grid[row][col] = color
    broadcastSetPixel(cell, color)
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
          setPixel(cell, 'white')
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
      context.fillStyle = grid[row][col]
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

export function Draw() {
  useEffect(() => {
    webSocket = new WebSocket('wss://draw-api.staging.ty.ler.dev')
    webSocket.addEventListener('open', () => {
      console.log('web socket open')
    })
    webSocket.addEventListener('message', (ev) => {
      const drawRequest = DrawRequest.parse(JSON.parse(ev.data))
      console.log(drawRequest)
    })
    let interval = window.setInterval(() => {
      if (
        webSocket?.readyState === WebSocketReadyState.Open &&
        broadcastQueue.length
      ) {
        const cells = broadcastQueue
        broadcastQueue = []
        const drawRequest: DrawRequest = {
          action: 'draw',
          payload: {
            cells,
          },
        }
        webSocket.send(JSON.stringify(drawRequest))
      }
    }, 100)
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
