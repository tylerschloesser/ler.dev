import { Link } from 'react-router-dom'
import { styled } from 'styled-components'
import { Blob } from './blob/index.js'
import { PATHS } from './paths.js'
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

enum RaceType {
  Marathon = 'marathon',
  HalfMarathon = 'half-marathon',
}

interface Race {
  type: RaceType
  name: string
  date: string
  time: string
  rank?: number
  participants?: number
  links?: string[]
  state: string
}

const RACES: Race[] = [
  {
    type: RaceType.Marathon,
    name: 'Minneapolis',
    date: '2015-05-31',
    time: '3:32:37',
    rank: 134,
    participants: 903,
    state: 'MN',
  },
  {
    type: RaceType.Marathon,
    name: "Rock 'n' Roll Seattle",
    date: '2016-06-18',
    time: '3:39:56',
    links: [
      'https://www.marathonfoto.com/Proofs?PIN=L2X659&lastName=Schloesser',
    ],
    rank: 279,
    participants: 2571,
    state: 'WA',
  },
  {
    type: RaceType.Marathon,
    name: "Rock 'n' Roll Nashville",
    date: '2017-04-29',
    time: '3:54:32',
    rank: 196,
    participants: 2383,
    state: 'TN',
  },
  {
    type: RaceType.HalfMarathon,
    name: "Rock 'n' Roll Seattle",
    date: '2019-06-08',
    time: '1:29:54',
    rank: 82,
    participants: 9968,
    state: 'WA',
  },
  {
    type: RaceType.Marathon,
    name: "Rock 'n' Roll Las Vegas",
    date: '2019-11-17',
    time: 'dnf-injury',
    state: 'NV',
  },
  {
    type: RaceType.Marathon,
    name: "Rock 'n' Roll Savannah",
    date: '2021-11-06',
    time: 'dnf-cancelled',
    state: 'GA',
  },
  {
    type: RaceType.Marathon,
    name: 'Red Rock Canyon',
    date: '2022-01-22',
    time: '3:28:55',
    rank: 3,
    participants: 73,
    state: 'NV',
  },
  {
    type: RaceType.Marathon,
    name: 'Mesa',
    date: '2022-02-12',
    time: '2:54:46',
    rank: 62,
    participants: 2312,
    state: 'AZ',
  },
  {
    type: RaceType.Marathon,
    name: 'Foot Traffic Flat',
    date: '2022-07-22',
    time: '3:04:57',
    rank: 18,
    participants: 205,
    state: 'OR',
  },
  {
    type: RaceType.Marathon,
    name: 'Chicago',
    date: '2022-10-09',
    time: '4:42:25',
    rank: 24_410,
    participants: 39_420,
    state: 'IL',
  },
  {
    type: RaceType.Marathon,
    name: 'Carlsbad',
    date: '2023-01-15',
    time: '3:16:38',
    rank: 51,
    participants: 1053,
    state: 'CA',
  },
]

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
    ({ type }) => type === RaceType.Marathon,
  ).filter(({ time }) => !time.startsWith('dnf'))

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
