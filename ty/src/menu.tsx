import { F } from 'lodash/fp'
import React, { useState } from 'react'
import styled from 'styled-components'

const ButtonContainer = styled.button`
  --size: var(--size);
  all: unset;
  display: block;
  position: relative;
  width: 100px;
  height: 100px;
  background: white;
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
  const size = 100
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

  return (
    <ButtonContainer ref={setRef}>
      <ButtonText viewBox="0 0 100 100">
        <path
          id="circle"
          fill="none"
          stroke="blue"
          d={[
            `M ${size / 2},${size}`,
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
        <text>
          <textPath href="#circle">Menu</textPath>
        </text>
      </ButtonText>
      <ButtonIcon />
    </ButtonContainer>
  )
}

export function Menu() {
  return (
    <>
      <Button />
    </>
  )
}
