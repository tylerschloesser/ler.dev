import { use } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'
import styles from './toolbar.module.scss'
import { resetCamera } from './use-camera.js'
import { useResetWorld } from './use-world.js'

export function Toolbar() {
  const navigate = useNavigate()
  const context = use(AppContext)

  const resetWorld = useResetWorld(context?.setWorld)

  return (
    <Overlay>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('..')
        }}
      >
        Back
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          if (self.confirm('Are you sure?')) {
            resetWorld()
            // TODO race condition here if
            // camera is moved & saved before
            // world is reset
            resetCamera()
          }
        }}
      >
        Reset
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('info')
        }}
      >
        Info
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('delete')
        }}
      >
        Delete
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('configure')
        }}
      >
        Configure
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('apply-force')
        }}
      >
        Apply Force
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('build-belt')
        }}
      >
        Add Belt
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('apply-friction')
        }}
      >
        Apply Friction
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('add-resource')
        }}
      >
        Add Resource
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('build-gear')
        }}
      >
        Add Gear
      </button>
    </Overlay>
  )
}
