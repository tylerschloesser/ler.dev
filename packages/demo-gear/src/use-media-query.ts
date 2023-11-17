import { useEffect, useState } from 'react'

export function useMediaQuery(
  query: string,
  signal: AbortSignal,
): boolean {
  const [list] = useState<MediaQueryList>(
    self.matchMedia(query),
  )
  const [state, setState] = useState<boolean>(list.matches)
  useEffect(() => {
    list.addEventListener(
      'change',
      (e) => {
        console.log('udpating media query')
        setState(e.matches)
      },
      { signal },
    )
  }, [])
  return state
}
