import React from 'react'
import styles from './overlay.module.scss'

export type OverlayProps = React.PropsWithChildren<{
  position?: 'top' | 'bottom'
}>

export function Overlay({
  position = 'bottom',
  children,
}: OverlayProps) {
  return (
    <div
      className={
        position === 'top'
          ? styles['outer-top']
          : styles['outer-bottom']
      }
    >
      <div className={styles.inner}>{children}</div>
    </div>
  )
}
