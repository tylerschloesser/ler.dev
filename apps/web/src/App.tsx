import styles from './App.module.css'
import { RaceStory } from './races/RaceStory.tsx'

export default function App() {
  return (
    <>
      <header className={styles.header}>
        <h1 id="page-title" className={styles.title}>
          Marathons
        </h1>
      </header>
      <RaceStory labelledBy="page-title" />
    </>
  )
}
