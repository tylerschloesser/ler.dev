import { useRef } from 'react'
import { addGear } from './add-gear.js'
import { GEAR_SIZES } from './const.js'
import { World } from './types.js'

export function useWorld(): React.MutableRefObject<World> {
  return useRef(
    (() => {
      const world: World = {
        gears: {},
        tiles: {},
      }

      addGear({
        position: {
          x: 0,
          y: 0,
        },
        size: GEAR_SIZES[1]!,
        world,
      })
      addGear({
        position: {
          x: 5,
          y: 0,
        },
        size: GEAR_SIZES[3]!,
        world,
      })

      return world
    })(),
  )
}
