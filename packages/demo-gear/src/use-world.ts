import { useRef } from 'react'
import { addGear } from './add-gear.js'
import { GEAR_RADIUSES } from './const.js'
import { ConnectionType, World } from './types.js'

export function useWorld(): React.MutableRefObject<World> {
  return useRef(
    (() => {
      const world: World = {
        gears: {},
        tiles: {},
      }

      const gear1 = addGear({
        position: {
          x: 0,
          y: 0,
        },
        radius: GEAR_RADIUSES[1]!,
        world,
        connections: [],
      })
      addGear({
        position: {
          x: 10,
          y: 0,
        },
        radius: GEAR_RADIUSES[3]!,
        world,
        connections: [
          {
            gearId: gear1.id,
            type: ConnectionType.Teeth,
          },
        ],
      })

      return world
    })(),
  )
}
