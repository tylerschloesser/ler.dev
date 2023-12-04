import { useNavigate } from 'react-router-dom'
import styles from './delete.module.scss'
import { Overlay } from './overlay.component.js'

export function Delete() {
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
    </Overlay>
  )
}
