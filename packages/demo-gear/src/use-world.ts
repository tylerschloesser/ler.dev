import { useRef } from 'react'
import invariant from 'tiny-invariant'
import { addGear } from './add-gear.js'
import { GEAR_RADIUSES } from './const.js'
import { getConnections } from './get-connections.js'
import { World } from './types.js'

export function useWorld(): React.MutableRefObject<World> {
  return useRef(
    (() => {
      const world: World = {
        gears: {},
        tiles: {},
      }

      for (const { position, radius } of [
        {
          position: { x: 0, y: 0 },
          radius: 1,
        },
        {
          position: { x: 3, y: 0 },
          radius: 2,
        },
      ]) {
        invariant(GEAR_RADIUSES.includes(radius))
        addGear({
          position,
          radius,
          world,
          connections: getConnections({
            position,
            radius,
            world,
          }),
        })
      }

      return world
    })(),
  )
}
