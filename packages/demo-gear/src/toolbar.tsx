import { useEffect, useState } from 'react'
import { GEAR_RADIUSES } from './const.js'
import { updatePointerMode } from './pointer-mode.js'
import styles from './toolbar.module.scss'
import { AppState, HandType, PointerMode } from './types.js'
import { useResetWorld, useSaveWorld } from './use-world.js'

export interface ToolbarProps {
  state: AppState
}

export function Toolbar({ state }: ToolbarProps) {
  const [debugConnections, setDebugConnections] = useState(
    state.world.debugConnections,
  )
  useEffect(() => {
    state.world.debugConnections = debugConnections
  }, [debugConnections])

  const save = useSaveWorld(state.world)
  const reset = useResetWorld(state.setWorld)

  return (
    <div className={styles.container}>
      <div>
        <div>Add Gear:</div>
        {GEAR_RADIUSES.map((radius) => (
          <button
            key={radius}
            onPointerUp={() => {
              state.hand = {
                type: HandType.Build,
                chain: null,
                connections: [],
                position: null,
                radius,
                valid: false,
              }
              updatePointerMode(state, PointerMode.Hand)
            }}
          >
            {radius}
          </button>
        ))}
      </div>
      <div>
        <div>Accelerate:</div>
        {[1, -1].map((acceleration) => (
          <button
            key={acceleration}
            onPointerUp={() => {
              state.hand = {
                type: HandType.Accelerate,
                active: false,
                direction: acceleration,
                gear: null,
                position: null,
              }
              updatePointerMode(state, PointerMode.Hand)
            }}
          >
            {acceleration}
          </button>
        ))}
      </div>
      <button onPointerUp={save}>Save</button>
      <button
        onPointerUp={() => {
          if (self.confirm('Are you sure?')) {
            reset()
          }
        }}
      >
        Reset
      </button>
      <label>
        <input
          type="checkbox"
          checked={debugConnections}
          onChange={() => {
            setDebugConnections((prev) => !prev)
          }}
        />
        Debug Connections
      </label>
    </div>
  )
}
