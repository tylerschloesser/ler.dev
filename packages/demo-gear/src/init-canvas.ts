import invariant from 'tiny-invariant'
import { DRAW_GEAR_BOX, TILE_SIZE } from './const.js'
import {
  ConnectionType,
  Gear,
  InitCanvasFn,
  PointerType,
} from './types.js'

export const initCanvas: InitCanvasFn = ({
  canvas,
  pointer,
  signal,
  world,
}) => {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  const context = canvas.getContext('2d')
  invariant(context)

  function render() {
    if (signal.aborted) {
      return
    }

    invariant(context)

    context.resetTransform()

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.translate(canvas.width / 2, canvas.height / 2)

    let grid = {
      tl: {
        x:
          Math.floor(-canvas.width / 2 / TILE_SIZE) *
          TILE_SIZE,
        y:
          Math.floor(-canvas.height / 2 / TILE_SIZE) *
          TILE_SIZE,
      },
      br: {
        x:
          Math.ceil(canvas.width / 2 / TILE_SIZE) *
          TILE_SIZE,
        y:
          Math.ceil(canvas.height / 2 / TILE_SIZE) *
          TILE_SIZE,
      },
    }

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = 'hsl(0, 0%, 10%)'
    for (let y = grid.tl.y; y < grid.br.y; y += TILE_SIZE) {
      context.moveTo(grid.tl.x, y)
      context.lineTo(grid.br.x, y)
    }
    for (let x = grid.tl.x; x < grid.br.x; x += TILE_SIZE) {
      context.moveTo(x, grid.tl.y)
      context.lineTo(x, grid.br.y)
    }
    context.stroke()
    context.closePath()

    function renderGear(
      gear: Pick<
        Gear,
        'radius' | 'position' | 'angle' | 'connections'
      >,
      tint?: string,
    ): void {
      invariant(context)

      context.save()
      context.translate(
        (gear.position.x - (gear.radius - 0.5)) * TILE_SIZE,
        (gear.position.y - (gear.radius - 0.5)) * TILE_SIZE,
      )

      if (DRAW_GEAR_BOX) {
        context.fillStyle = 'grey'
        context.fillRect(
          0,
          0,
          TILE_SIZE * gear.radius * 2,
          TILE_SIZE * gear.radius * 2,
        )
      }

      context.strokeStyle = 'white'
      context.fillStyle = 'blue'
      context.beginPath()
      context.arc(
        gear.radius * TILE_SIZE,
        gear.radius * TILE_SIZE,
        gear.radius * TILE_SIZE,
        0,
        Math.PI * 2,
      )
      context.fill()
      context.closePath()

      context.save()
      context.translate(
        gear.radius * TILE_SIZE,
        gear.radius * TILE_SIZE,
      )
      context.beginPath()
      context.lineWidth = 2
      context.strokeStyle = 'white'
      const teeth = gear.radius * 10
      for (let i = 0; i < teeth; i++) {
        context.save()
        context.rotate(
          gear.angle + (i / teeth) * Math.PI * 2,
        )
        context.moveTo((gear.radius - 0.25) * TILE_SIZE, 0)
        context.lineTo(gear.radius * TILE_SIZE, 0)
        context.stroke()
        context.restore()
      }
      context.closePath()
      context.restore()

      if (tint) {
        context.fillStyle = tint
        context.fillRect(
          0,
          0,
          TILE_SIZE * gear.radius * 2,
          TILE_SIZE * gear.radius * 2,
        )
      }

      context.restore()

      for (const connection of gear.connections) {
        const peer = world.gears[connection.gearId]
        invariant(peer)

        if (connection.type === ConnectionType.Chain) {
          context.beginPath()
          context.strokeStyle = 'hsla(0, 50%, 50%, .75)'
          context.lineWidth = 2
          context.strokeRect(
            Math.min(peer.position.x, gear.position.x) *
              TILE_SIZE,
            Math.min(peer.position.y, gear.position.y) *
              TILE_SIZE,
            (Math.abs(peer.position.x - gear.position.x) +
              1) *
              TILE_SIZE,
            (Math.abs(peer.position.y - gear.position.y) +
              1) *
              TILE_SIZE,
          )
          context.closePath()
        } else {
          context.beginPath()
          context.strokeStyle = 'hsla(0, 50%, 50%, .75)'
          context.lineWidth = 2
          context.moveTo(
            (gear.position.x + 0.5) * TILE_SIZE,
            (gear.position.y + 0.5) * TILE_SIZE,
          )
          context.lineTo(
            (peer.position.x + 0.5) * TILE_SIZE,
            (peer.position.y + 0.5) * TILE_SIZE,
          )
          context.stroke()
          context.closePath()
        }
      }
    }

    for (const gear of Object.values(world.gears)) {
      renderGear(gear)
    }

    if (
      pointer.current.type === PointerType.AddGear &&
      pointer.current.state
    ) {
      const { size, state } = pointer.current
      if (state.chain) {
        context.beginPath()
        context.lineWidth = 2
        context.strokeStyle = 'white'
        context.strokeRect(
          state.position.x * TILE_SIZE,
          state.position.y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE,
        )
        context.closePath()
      } else {
        renderGear(
          {
            position: state.position,
            radius: size / 2,
            angle: 0,
            connections: state.connections,
          },
          state.valid
            ? `hsla(120, 50%, 50%, .5)`
            : `hsla(0, 50%, 50%, .5)`,
        )
      }
    }

    if (
      pointer.current.type === PointerType.ApplyForce &&
      pointer.current.state?.gearId
    ) {
      const gear = world.gears[pointer.current.state.gearId]
      const { active } = pointer.current.state
      invariant(gear)

      context.beginPath()
      context.lineWidth = 2
      context.strokeStyle = active ? 'green' : 'white'
      context.strokeRect(
        (gear.position.x - (gear.radius - 0.5)) * TILE_SIZE,
        (gear.position.y - (gear.radius - 0.5)) * TILE_SIZE,
        TILE_SIZE * gear.radius * 2,
        TILE_SIZE * gear.radius * 2,
      )
      context.closePath()
    }

    if (
      pointer.current.type === PointerType.AddGearWithChain
    ) {
      const source = world.gears[pointer.current.sourceId]
      invariant(source)

      let chain = {
        x: source.position.x,
        y: source.position.y,
        w: 1,
        h: 1,
      }

      const { state } = pointer.current
      if (state) {
        renderGear(
          {
            position: state.position,
            radius: 0.5,
            angle: 0,
            connections: [], // TODO
          },
          state.valid
            ? `hsla(120, 50%, 50%, .5)`
            : `hsla(0, 50%, 50%, .5)`,
        )

        if (state.valid) {
          chain = {
            x: Math.min(chain.x, state.position.x),
            y: Math.min(chain.y, state.position.y),
            w: Math.abs(chain.x - state.position.x) + 1,
            h: Math.abs(chain.y - state.position.y) + 1,
          }
        }
      }

      context.beginPath()
      context.lineWidth = 2
      context.strokeStyle = 'white'
      context.strokeRect(
        chain.x * TILE_SIZE,
        chain.y * TILE_SIZE,
        chain.w * TILE_SIZE,
        chain.h * TILE_SIZE,
      )
      context.closePath()
    }

    window.requestAnimationFrame(render)
  }
  window.requestAnimationFrame(render)
}
