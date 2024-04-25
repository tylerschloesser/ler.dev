import { Link } from 'react-router-dom'
import { styled } from 'styled-components'
import { Blob } from './blob/index.js'
import { PATHS } from './paths.js'
import { MarathonRace, RACES, RaceType } from './races.js'
import { UsMap } from './us-map.js'

const HomeContainer = styled.div`
  --color-text: hsl(0, 0%, 80%);
`

const HomeTitle = styled.h1`
  display: flex;
  justify-content: flex-end;
  font-weight: 700;
  color: var(--color-text);
  font-size: 1.25rem;
  padding: 0.5rem;
`

const List = styled.ol`
  display: flex;
  flex-direction: column;
  font-size: 1.25rem;
`

const ListItem = styled.li``

const StyledLink = styled(Link)`
  display: block;
  padding: 0.5rem;
  color: var(--color-text);
`

const BlobContainer = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
`

const Hero = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: space-between;
`

const RaceContainer = styled.div`
  background-color: hsl(100, 22%, 80%);
  color: hsl(0, 0%, 10%);
  min-height: 100vh;
`

const RaceProgress = styled.div`
  display: flex;
  justify-content: center;
  font-size: 4rem;
  padding: 2rem;
`

const TableContainer = styled.div`
  display: flex;
  justify-content: center;
`

const TableData = styled.td`
  padding: 0.5rem;
`

const TableHeader = styled.th`
  padding: 0.5rem;
`

export function Home() {
  const marathons = RACES.filter(
    (race): race is MarathonRace =>
      race.type === RaceType.Marathon,
  )

  const coloredStates = marathons.reduce<Set<string>>(
    (acc, { state }) => acc.add(state),
    new Set(),
  )

  return (
    <HomeContainer>
      <BlobContainer>
        <Blob
          config={{
            parts: 500,
            xScale: 0.6,
            yScale: 0.6,
            zScale: 1 / 5_000,
          }}
        />
      </BlobContainer>
      <Hero>
        <List>
          {PATHS.map(({ path, root }, i) => (
            <ListItem key={i}>
              <StyledLink to={root ?? path}>
                {(root ?? path).toUpperCase()}
              </StyledLink>
            </ListItem>
          ))}
        </List>
        <HomeTitle>ty.ler.dev</HomeTitle>
      </Hero>
      <RaceContainer>
        <RaceProgress>
          {
            marathons
              .map(({ state }) => state)
              .reduce<Set<string>>(
                (acc, state) => acc.add(state),
                new Set(),
              ).size
          }{' '}
          / 50
        </RaceProgress>
        <UsMap coloredStates={coloredStates} />
        <TableContainer>
          <table>
            <thead>
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Time</TableHeader>
                <TableHeader>State</TableHeader>
              </tr>
            </thead>
            <tbody>
              {marathons.map(
                ({ name, date, time, state }, i) => (
                  <tr key={i}>
                    <TableData>{name} Marathon</TableData>
                    <TableData>{date}</TableData>
                    <TableData>{time}</TableData>
                    <TableData>{state}</TableData>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </TableContainer>
      </RaceContainer>
    </HomeContainer>
  )
}
