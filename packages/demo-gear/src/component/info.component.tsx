import { useNavigate } from 'react-router-dom'
import styles from './info.module.scss'
import { Overlay } from './overlay.component.js'

export function Info() {
  const navigate = useNavigate()
  return (
    <>
      <Overlay position="top">TODO</Overlay>
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
    </>
  )
}
