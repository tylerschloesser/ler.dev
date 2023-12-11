import invariant from 'tiny-invariant'
import { BuildHand, Entity, IAppContext } from './types.js'
import { getFirstExternalConnection } from './util.js'

export function tickBuild(
  context: IAppContext,
  hand: BuildHand,
  elapsed: number,
): void {
  if (!hand.valid) return
  const first = getFirstExternalConnection(context, hand)
  if (!first) return
  const { root, external, connection } = first

  // TODO get all incoming connections and if they're equal,
  // update the velocities, otherwise set velocities to zero
  //

  root.velocity =
    external.velocity * (1 / connection.multiplier)

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
