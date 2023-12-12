import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  EntityType,
  IAppContext,
  Network,
  TickListenerFn,
} from '../types.js'
import { throttle } from '../util.js'
import { AppContext } from './context.js'
import styles from './info.module.scss'
import { Overlay } from './overlay.component.js'

function getEnergy(
  context: IAppContext,
  network: Network,
): number {
  let energy = 0
  for (const entityId of Object.keys(network.entityIds)) {
    const entity = context.world.entities[entityId]
    invariant(entity)

    switch (entity.type) {
      case EntityType.enum.Gear: {
        energy +=
          0.5 * 0.5 * entity.mass * entity.velocity ** 2
        break
      }
      case EntityType.enum.Belt:
      case EntityType.enum.BeltIntersection: {
        energy += 0.5 * entity.mass * entity.velocity ** 2
        break
      }
      default: {
        invariant(false)
      }
    }
  }
  return energy
}

export function Info() {
  const navigate = useNavigate()
  const context = use(AppContext)

  const [state, setState] = useState<{
    networks: {
      mass: number
      entities: number
      energy: number
    }[]
  }>({
    networks: [],
  })

  useEffect(() => {
    const listener: TickListenerFn = throttle(() => {
      const networks = Object.values(
        context.world.networks,
      ).map((n) => ({
        mass: n.mass,
        entities: Object.keys(n.entityIds).length,
        energy: getEnergy(context, n),
      }))
      setState({ networks })
    }, 100)
    context.tickListeners.add(listener)
    return () => {
      context.tickListeners.delete(listener)
    }
  }, [])

  return (
    <>
      <Overlay position="top">
        <table>
          <thead>
            <tr>
              <th>Network</th>
              <th>Mass</th>
              <th>Entities</th>
              <th>Energy</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(state.networks).map(
              ({ mass, entities, energy }, i) => (
                <tr key={i}>
                  <td>{i}</td>
                  <td>{mass.toFixed(2)}</td>
                  <td>{entities}</td>
                  <td>{energy.toFixed(2)}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </Overlay>
      <Overlay>
        <button
          className={styles.button}
          onPointerUp={() => {
            navigate('..')
          }}
        >
          Back
        </button>
      </Overlay>
    </>
  )
}
