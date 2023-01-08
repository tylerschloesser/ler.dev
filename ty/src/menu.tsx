import React, { useState } from 'react'
import styled from 'styled-components'

const DEBUG: boolean = false

const ButtonContainer = styled.button`
  --size: var(--size);
  all: unset;
  display: block;
  position: relative;
  width: 100px;
  height: 100px;
`

const ButtonText = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
`

const ButtonIcon = styled.span`
  position: absolute;
  display: block;
  width: var(--size);
  height: var(--size);
  top: calc(var(--size) / 2);
  left: calc(var(--size) / 2);
  background-color: pink;
  border-radius: 100%;
`

function Button() {
  const [ref, setRef] = useState<HTMLButtonElement | null>(null)
  // const size = (() => {
  //   try {
  //     return parseInt(
  //       window
  //         .getComputedStyle(ref!)
  //         .getPropertyValue('--size')
  //         .replace(/px/, ''),
  //     )
  //   } catch {
  //     return 0
  //   }
  // })()
  // console.log(size)

  interface ArcProps {
    rx: number
    ry: number
    angle: number
    'large-arc-flag': 0 | 1
    'sweep-flag': 0 | 1
    dx: number
    dy: number
  }

  // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#elliptical_arc_curve
  function arc(p: ArcProps) {
    return [
      'a',
      p.rx,
      p.ry,
      p.angle,
      p['large-arc-flag'],
      p['sweep-flag'],
      p.dx,
      p.dy,
    ].join(' ')
  }

  const size = 100

  // TODO had to find this manually. Can we calculate?
  const rotate = 90 - 22

  return (
    <ButtonContainer ref={setRef}>
      <ButtonText viewBox={`0 0 ${size} ${size}`} overflow="visible">
        <path
          id="circle"
          fill="none"
          {...(DEBUG
            ? {
                stroke: 'white',
              }
            : {})}
          d={[
            `M 0,${size / 2}`,
            arc({
              rx: size / 2,
              ry: size / 2,
              angle: 0,
              'large-arc-flag': 1,
              'sweep-flag': 1,
              dx: size,
              dy: 0,
            }),
            arc({
              rx: size / 2,
              ry: size / 2,
              angle: 0,
              'large-arc-flag': 1,
              'sweep-flag': 1,
              dx: -size,
              dy: 0,
            }),
          ].join('')}
        />
        <text transform={`rotate(${rotate}, ${size / 2}, ${size / 2})`}>
          <textPath fill="white" href="#circle">
            Menu
          </textPath>
        </text>
      </ButtonText>
      <ButtonIcon />
    </ButtonContainer>
  )
}

const MenuContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
`

export function Menu() {
  return (
    <MenuContainer>
      <Button />
    </MenuContainer>
  )
}
