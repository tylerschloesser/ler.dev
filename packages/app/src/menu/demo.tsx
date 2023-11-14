import { shuffle, times } from 'lodash'
import { useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { Menu } from './menu.js'

const ImageList = styled.ol`
  display: flex;
  flex-direction: column;
  width: 50vw;
`

const ImageListItem = styled.li`
  box-sizing: border-box;
  width: 100%;
  padding: 1rem;

  &:not(:last-child) {
    padding-bottom: 0;
  }
`

const Image = styled.img`
  width: 100%;
`

const Title = styled.div`
  position: fixed;
  left: 50vw;
  bottom: 50vh;
  text-transform: uppercase;
  padding-bottom: 0.25rem;
  padding-right: 0.5rem;
  border-bottom: 2px solid hsl(0, 0%, 90%);
`

const TitleLine = styled.div``

const MainContainer = styled.div`
  height: 100vh;
  transition: transform 0.5s;
  &.menu-open {
    transition: transform 0.5s;
    transform: translateY(-80vh);
  }
`

const images = shuffle(times(5)).map((i) => ({
  src: `menu-demo-${i + 1}.jpg`,
}))

export function Demo() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    console.log({ open })
  }, [open])

  return (
    <>
      <MainContainer
        className={open ? 'menu-open' : undefined}
      >
        <Title>
          {'The future is futuristic'
            .split(' ')
            .map((line) => (
              <TitleLine key={line}>{line}</TitleLine>
            ))}
        </Title>
        <ImageList>
          {images.map(({ src }) => (
            <ImageListItem key={src}>
              <Image src={src} />
            </ImageListItem>
          ))}
        </ImageList>
      </MainContainer>
      <Menu
        onClick={() => {
          setOpen((prev) => !prev)
        }}
      />
    </>
  )
}
