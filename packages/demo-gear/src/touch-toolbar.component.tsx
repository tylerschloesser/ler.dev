import styles from './touch-toolbar.module.scss'
import { AppState } from './types.js'

export interface TouchToolbarProps {
  state: AppState
}

export function TouchToolbar(props: TouchToolbarProps) {
  return (
    <div className={styles.container}>
      <button className={styles.button}>Add Gear</button>
    </div>
  )
}
