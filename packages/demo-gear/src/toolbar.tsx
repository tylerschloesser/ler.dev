import { useEffect, useState } from 'react'
import { GEAR_RADIUSES } from './const.js'
import styles from './toolbar.module.scss'
import { AppState, HoverType } from './types.js'
import { useResetWorld, useSaveWorld } from './use-world.js'

export interface ToolbarProps {
  context: AppState
}

export function Toolbar({ context }: ToolbarProps) {
  const [debugConnections, setDebugConnections] = useState(
    context.world.debugConnections,
  )
  useEffect(() => {
    context.world.debugConnections = debugConnections
  }, [debugConnections])

  const save = useSaveWorld(context.world)
  const reset = useResetWorld(context.setWorld)

  return (
    <div className={styles.container}>
      <div>
        <div>Add Gear:</div>
        {GEAR_RADIUSES.map((radius) => (
          <button
            key={radius}
            onPointerUp={() => {
              context.hover = {
                type: HoverType.AddGear,
                radius,
                connections: [],
                valid: false,
                reasons: [],
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
              context.hover = {
                type: HoverType.ApplyForce,
                acceleration,
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
