import { useNavigate } from 'react-router-dom'
import styles from './add-resource.module.scss'
import { Overlay } from './overlay.component.js'

export function AddResource() {
  const navigate = useNavigate()
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
      <button className={styles.button}>
        Add Resource
      </button>
    </Overlay>
  )
}
