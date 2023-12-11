import invariant from 'tiny-invariant'
import { BuildHand, Entity, IAppContext } from './types.js'
import {
  getExternalNetworks,
  resetEntities,
} from './util.js'

export function tickBuild(
  context: IAppContext,
  hand: BuildHand,
  elapsed: number,
): void {
  if (!hand.valid) return

  const root = Object.values(hand.entities).at(0)
  invariant(root)
  const externalNetworks = getExternalNetworks(
    context,
    hand,
    root,
  )

  let incomingVelocity: number | undefined
  for (const value of Object.values(externalNetworks)) {
    if (value.incomingVelocity !== 0) {
      if (incomingVelocity === undefined) {
        incomingVelocity = value.incomingVelocity
      } else if (
        incomingVelocity !== value.incomingVelocity
      ) {
        // the networks have differing non-zero velocities
        // in this case don't animate the build
        incomingVelocity = undefined
        break
      }
    }
  }

  if (incomingVelocity === undefined) {
    resetEntities(hand.entities)
    return
  }

  root.velocity = incomingVelocity

  const seen = new Set<Entity>()
  const stack = new Array<Entity>(root)

  while (stack.length) {
    const current = stack.pop()
    invariant(current)
    invariant(!seen.has(current))
    seen.add(current)

    for (const c of current.connections) {
      if (!hand.entities[c.entityId]) continue
      const neighbor = hand.entities[c.entityId]
      invariant(neighbor)

      if (!seen.has(neighbor)) {
        neighbor.velocity = current.velocity * c.multiplier
        stack.push(neighbor)
      }
    }
  }
}
