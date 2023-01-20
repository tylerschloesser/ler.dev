import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Blob } from './blob'
import { PATHS } from './paths'
import { UsMap } from './us-map'

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

const Period = styled.span`
  margin: 0 -0.2rem;
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
  position: fixed;
  width: 100vw;
  height: 100vh;
  opacity: var(--opacity);
  transition: opacity 100ms linear;
`

const Hero = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: space-between;
  margin-bottom: 200vh;
`

const MarathonList = styled.ol``

const MarathonListItem = styled.li``

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

export function Home() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!container) return
    window.addEventListener('scroll', () => {
      const rect = container.getBoundingClientRect()
      const opacity = Math.max(1 - window.scrollY / rect.height, 0)
      container!.style.setProperty('--opacity', `${opacity}`)
    })
  }, [container])

  return (
    <HomeContainer ref={setContainer}>
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
          {PATHS.map(({ path }) => (
            <ListItem key={path}>
              <StyledLink to={path}>{path.toUpperCase()}</StyledLink>
            </ListItem>
          ))}
        </List>
        <HomeTitle>
          ty<Period>.</Period>ler<Period>.</Period>dev
        </HomeTitle>
      </Hero>
      <UsMap />
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
          {RACES.filter(({ type }) => type === RaceType.Marathon)
            .filter(({ time }) => !time.startsWith('dnf'))
            .map(({ name, date, time, state }, i) => (
              <tr key={i}>
                <td>{name} Marathon</td>
                <td>{date}</td>
                <td>{time}</td>
                <td>{state}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </HomeContainer>
  )
}
