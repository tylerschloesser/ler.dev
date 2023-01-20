import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Blob } from './blob'
import { PATHS } from './paths'

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
    </HomeContainer>
  )
}
