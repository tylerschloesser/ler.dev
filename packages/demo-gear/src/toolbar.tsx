import { useEffect, useState } from 'react'
import { initAccelerate } from './accelerate.js'
import { initBuild } from './build.js'
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
              initBuild(state, radius)
            }}
          >
            {radius}
          </button>
        ))}
      </div>
      <div>
        <div>Accelerate:</div>
        {[1, -1].map((direction) => (
          <button
            key={direction}
            onPointerUp={() => {
              initAccelerate(state, direction)
            }}
          >
            {direction}
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
