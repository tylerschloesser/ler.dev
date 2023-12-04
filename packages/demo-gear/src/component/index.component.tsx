import { useNavigate } from 'react-router-dom'
import styles from './index.module.scss'
import { Overlay } from './overlay.component.js'

export function Index() {
  const navigate = useNavigate()
  return (
    <Overlay>
      <button
        className={styles.button}
        onClick={() => {
          navigate('tools')
        }}
      >
        Tools
      </button>
    </Overlay>
  )
}
