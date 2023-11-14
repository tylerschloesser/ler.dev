import { GEAR_SIZES } from './const.js'
import styles from './toolbar.module.scss'
import { Pointer, PointerType } from './types.js'

export interface ToolbarProps {
  pointer: React.MutableRefObject<Pointer>
}

export function Toolbar({ pointer }: ToolbarProps) {
  return (
    <div className={styles.container}>
      <div>
        <div>Add Gear:</div>
        {GEAR_SIZES.map((size) => (
          <button
            key={size}
            onPointerUp={() => {
              pointer.current = {
                type: PointerType.AddGear,
                size,
                state: null,
              }
            }}
          >
            {size}
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
    </div>
  )
}
