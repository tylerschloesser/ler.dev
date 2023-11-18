import { useEffect, useState } from 'react'
import { GEAR_RADIUSES } from './const.js'
import styles from './toolbar.module.scss'
import { AppState } from './types.js'
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
              state.build = {
                chain: null,
                connections: [],
                position: null,
                radius,
                valid: false,
              }
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
              state.accelerate = {
                active: false,
                direction: acceleration,
                gear: null,
                position: null,
              }
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
