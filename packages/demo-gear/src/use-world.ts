import { useMemo, useRef } from 'react'
import invariant from 'tiny-invariant'
import { addGear } from './add-gear.js'
import { GEAR_RADIUSES } from './const.js'
import { getConnections } from './get-connections.js'
import { World } from './types.js'

function loadWorld(): World {
  const json = localStorage.getItem('world')
  if (json) {
    try {
      return World.parse(JSON.parse(json))
    } catch (e) {
      console.error(e)
      if (
        self.confirm(
          'Invalid saved world. Clear and reload?',
        )
      ) {
        self.localStorage.removeItem('world')
        self.location.reload()
      }
    }
  }

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
}

export function useWorld(): React.MutableRefObject<World> {
  const world = useMemo(() => loadWorld(), [])
  return useRef(world)
}
