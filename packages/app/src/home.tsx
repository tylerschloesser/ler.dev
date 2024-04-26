import { Fragment, useMemo } from 'react'
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
      <div className="flex justify-center min-h-dvh">
        <div className="max-w-[1024px] p-2">
          <UsMap coloredStates={coloredStates} />
          <p>
            {
              new Set(marathons.map(({ state }) => state))
                .size
            }{' '}
            / 50
          </p>
        </div>
        <div>
          <div className="grid grid-cols-3 items-center">
            {marathons.map(({ name, state, time }, i) => (
              <Fragment key={i}>
                <div className="">
                  <h3 className="text-3xl">{name}</h3>
                  <p className="text-sm text-gray-400 -mt-2">
                    Marathon
                  </p>
                </div>
                <div className="font-mono text-2xl justify-self-end">
                  {state}
                </div>
                <div className="font-mono text-2xl justify-self-end">
                  {time}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
