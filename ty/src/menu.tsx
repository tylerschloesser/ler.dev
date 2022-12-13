import React, { useState } from 'react'
import styled from 'styled-components'

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
  const size = (() => {
    try {
      return parseInt(
        window
          .getComputedStyle(ref!)
          .getPropertyValue('--size')
          .replace(/px/, ''),
      )
    } catch {
      return 0
    }
  })()
  console.log(size)

  return (
    <ButtonContainer ref={setRef}>
      <ButtonText viewBox="0 0 100 100">
        <path
          id="circle"
          fill="none"
          stroke="none"
          d={`M ${size / 2}, ${size} a ${size / 2},${
            size / 2
          } 0 1,1 ${size},0 a ${size / 2},${size / 2} 0 1,1 -${size},0`}
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
