import { RACES } from '../data/races.ts'
import { RaceCard } from './RaceCard.tsx'
import styles from './RaceStory.module.css'

export function RaceStory({ labelledBy }: { labelledBy: string }) {
  return (
    <section className={styles.story} aria-labelledby={labelledBy}>
      <div className={styles.globe} />
      <ol className={styles.list} aria-label="Races">
        {RACES.map((race) => (
          <li key={race.id}>
            <RaceCard race={race} active={false} highlighted={false} onHover={() => {}} />
          </li>
        ))}
      </ol>
    </section>
  )
}
