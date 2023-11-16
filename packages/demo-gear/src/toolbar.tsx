import {useEffect, useState} from 'react'
import { GEAR_RADIUSES, WORLD_KEY } from './const.js'
import styles from './toolbar.module.scss'
import { Pointer, PointerType, World } from './types.js'

export interface ToolbarProps {
  world: React.MutableRefObject<World>
  pointer: React.MutableRefObject<Pointer>
  save(): void
}

export function Toolbar({ pointer, save, world }: ToolbarProps) {

  const [debugConnections, setDebugConnections] = useState(world.current.debugConnections ?? false )
  useEffect(() => {
    world.current.debugConnections = debugConnections
  }, [ debugConnections ])

  return (
    <div className={styles.container}>
      <div>
        <div>Add Gear:</div>
        {GEAR_RADIUSES.map((radius) => (
          <button
            key={radius}
            onPointerUp={() => {
              pointer.current = {
                type: PointerType.AddGear,
                radius,
                state: null,
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
              pointer.current = {
                type: PointerType.ApplyForce,
                acceleration,
                state: null,
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
            self.localStorage.removeItem(WORLD_KEY)
            self.location.reload()
          }
        }}
      >
        Reset
      </button>
      <label>
        <input type="checkbox" checked={debugConnections} onChange={() => {
          setDebugConnections(prev => !prev)
        }} />
        Debug Connections
      </label>
    </div>
  )
}
