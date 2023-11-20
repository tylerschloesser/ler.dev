import { useState } from 'react'
import styles from './touch-toolbar.module.scss'
import { AppState } from './types.js'

export interface TouchToolbarProps {
  state: AppState
}

type View = 'main' | 'add-gear'

export function TouchToolbar(props: TouchToolbarProps) {
  const [view, setView] = useState<View>('main')

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onPointerUp={() => {
          console.log('todo')
        }}
      >
        Add Gear
      </button>
    </div>
  )
}
