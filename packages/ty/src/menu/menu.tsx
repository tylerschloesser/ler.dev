import { CSSProperties, useMemo, useState } from 'react'
import { styled } from 'styled-components'

const DEBUG: boolean = false

const ButtonContainer = styled.button`
  all: unset;
  display: block;
  position: relative;
  width: 100px;
  height: 100px;
  cursor: pointer;

  transition: transform 1s;

  &:hover {
    transform: scale(1.1);
  }
`

const ButtonText = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
`

const ButtonIcon = styled.span`
  --padding: 0.9;
  position: absolute;
  display: block;
  width: calc(var(--size) * var(--padding));
  height: calc(var(--size) * var(--padding));
  top: calc(var(--size) * (1 - var(--padding)) / 2);
  left: calc(var(--size) * (1 - var(--padding)) / 2);
  background-color: pink;
  border-radius: 100%;
`

interface ButtonProps {
  onClick(): void
}

function Button({ onClick }: ButtonProps) {
  const [ref, setRef] = useState<HTMLButtonElement | null>(null)

  const size = useMemo<null | number>(() => {
    if (!ref) {
      return null
    }
    const rect = ref.getBoundingClientRect()
    if (rect.width !== rect.height) {
      throw Error('width !== height')
    }
    return rect.width
  }, [ref])

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

  // TODO had to find this manually. Can we calculate?
  const rotate = 180 - 22

  return (
    <ButtonContainer
      onClick={onClick}
      ref={setRef}
      style={
        {
          '--size': `${size}px`,
        } as CSSProperties
      }
    >
      {size && (
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
      )}
      <ButtonIcon />
    </ButtonContainer>
  )
}

const MenuContainer = styled.div`
  position: fixed;
  bottom: 0;
  box-sizing: border-box;
  padding: 1rem;
  display: flex;
  width: 100%;
  align-items: end;
  justify-content: center;
`

interface MenuProps {
  onClick(): void
}

export function Menu({ onClick }: MenuProps) {
  return (
    <MenuContainer>
      <Button onClick={onClick} />
    </MenuContainer>
  )
}
