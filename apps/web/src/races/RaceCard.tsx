import type { Race } from '../data/races.ts'
import styles from './RaceCard.module.css'
import { formatDate, formatNumber, formatPlace } from './format.ts'

type Props = {
  race: Race
  active: boolean
  highlighted: boolean
  onHover: (id: string | null) => void
}

export function RaceCard({ race, active, highlighted, onHover }: Props) {
  const { outcome } = race
  const headingId = `race-${race.id}`
  return (
    <article
      className={styles.card}
      data-race-id={race.id}
      data-status={outcome.status}
      data-highlighted={highlighted}
      aria-current={active ? 'true' : undefined}
      aria-labelledby={headingId}
      onPointerEnter={() => onHover(race.id)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(race.id)}
      onBlur={() => onHover(null)}
    >
      <p className={styles.meta}>
        <time dateTime={race.date}>{formatDate(race.date)}</time>
        <span aria-hidden="true"> · </span>
        <span>{formatPlace(race.locationId)}</span>
      </p>
      <h2 id={headingId} className={styles.name} tabIndex={-1}>
        {race.name}
        {race.distance === 'half-marathon' && <span className={styles.badge}>Half</span>}
      </h2>
      {outcome.status === 'finished' ? (
        <dl className={styles.result}>
          <div>
            <dt>Time</dt>
            <dd className={styles.time}>{outcome.time}</dd>
          </div>
          {outcome.rank !== undefined && (
            <div>
              <dt>Place</dt>
              <dd className={styles.place}>
                {formatNumber(outcome.rank)}
                {outcome.participants !== undefined && ` / ${formatNumber(outcome.participants)}`}
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <dl className={styles.result}>
          <div>
            <dt>Result</dt>
            <dd className={styles.dnf}>
              DNF · {outcome.reason === 'cancelled' ? 'race cancelled' : 'injury'}
            </dd>
          </div>
        </dl>
      )}
      {race.links && (
        <ul className={styles.links}>
          {race.links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
