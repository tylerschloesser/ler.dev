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

  const seen = new Set<Entity>()
  const stack = new Array<{
    entity: Entity
    multiplier: number
  }>({
    entity: root,
    multiplier: connection.multiplier,
  })

  while (stack.length) {
    const current = stack.pop()
    invariant(current)
    const { entity, multiplier } = current
    invariant(!seen.has(entity))
    seen.add(entity)
    entity.velocity = external.velocity * multiplier

    for (const c of entity.connections) {
      if (!hand.entities[c.entityId]) continue
      const neighbor = hand.entities[c.entityId]
      invariant(neighbor)
      if (!seen.has(neighbor)) {
        stack.push({
          entity: neighbor,
          multiplier: multiplier * c.multiplier,
        })
      }
    }
  }
}
