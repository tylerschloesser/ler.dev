import { useMemo } from 'react'
import { Blob } from './blob/index.js'
import { MarathonRace, RACES, RaceType } from './races.js'
import { UsMap } from './us-map.js'

export function Home() {
  const marathons = useMemo(
    () =>
      RACES.filter(
        (race): race is MarathonRace =>
          race.type === RaceType.Marathon,
      ),
    [RACES],
  )

  const coloredStates = useMemo(
    () =>
      marathons.reduce<Set<string>>(
        (acc, { state }) => acc.add(state),
        new Set(),
      ),
    [marathons],
  )

  return (
    <>
      <Blob
        className="h-dvh w-dvw"
        config={{
          parts: 500,
          xScale: 0.6,
          yScale: 0.6,
          zScale: 1 / 5_000,
        }}
      />
      <p>
        {new Set(marathons.map(({ state }) => state)).size}{' '}
        / 50
      </p>
      <UsMap coloredStates={coloredStates} />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {marathons.map(
            ({ name, date, time, state }, i) => (
              <tr key={i}>
                <td>{name} Marathon</td>
                <td>{date}</td>
                <td>{time}</td>
                <td>{state}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </>
  )
}
