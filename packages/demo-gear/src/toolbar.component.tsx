import { use } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from './context.js'
import styles from './toolbar.module.scss'
import { useResetWorld, useSaveWorld } from './use-world.js'

export function Toolbar() {
  const navigate = useNavigate()
  const state = use(AppContext)
  const save = useSaveWorld(state?.world)
  const reset = useResetWorld(state?.setWorld)

  return (
    <div className={styles.container}>
      <button className={styles.button} onPointerUp={save}>
        Save
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          if (self.confirm('Are you sure?')) {
            reset()
          }
        }}
      >
        Reset
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('accelerate')
        }}
      >
        Accelerate
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('add-gear')
        }}
      >
        Add Gear
      </button>
    </div>
  )
}
