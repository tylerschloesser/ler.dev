import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  width: 100vw;
  height: 100vh;
`

export function Cal() {
  const [container, setContainer] = useState<HTMLDivElement | null>()
  return <Container ref={setContainer}>Cal</Container>
}
