import invariant from 'tiny-invariant'
import { BuildHand, Entity, IAppContext } from './types.js'
import {
  getExternalConnections,
  resetNetwork,
} from './util.js'

export function tickBuild(
  context: IAppContext,
  hand: BuildHand,
  elapsed: number,
): void {
  if (!hand.valid) return

  const root = Object.values(hand.entities).at(0)
  invariant(root)
  const external = getExternalConnections(
    context,
    hand.entities,
    root,
  )
  const ignore = new Set(
    external.map(({ connection }) => connection),
  )
  if (external.length === 0) {
    resetNetwork(context, root, ignore)
    return
  }

  const first = external.at(0)
  invariant(first)

  // 1 over the connection multipler, because this is a connection
  // in the "wrong" direction (the connection from the first external
  // entity to the build entity doesn't exist yet)
  //
  const incomingVelocity =
    first.target.velocity *
    (1 / first.connection.multiplier)

  // check whether all incoming velocities are the same
  for (const check of external.slice(1)) {
    if (
      incomingVelocity !==
      check.target.velocity *
        (1 / check.connection.multiplier)
    ) {
      // in this case, we are connecting two separate networks.
      // while building, don't show velocities

      resetNetwork(context, root, ignore)
      return
    }
  }

  first.source.velocity = incomingVelocity

  const seen = new Set<Entity>()
  const stack = new Array<Entity>(first.source)

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
