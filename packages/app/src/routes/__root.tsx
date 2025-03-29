import {
  createRootRoute,
  Outlet,
  useRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import React, { Suspense, useEffect } from 'react'
import { AppContext } from '../app-context.ts'

const DEV_MODE = false

const HomeBackground = React.lazy(
  () => import('../home-background.tsx'),
)

export const Route = createRootRoute({
  component: () => {
    const isFirstLoad = useIsFirstLoad()
    return (
      <AppContext.Provider value={{ isFirstLoad }}>
        <div className="relative">
          <div className="print:hidden absolute w-screen h-screen">
            <Suspense>
              <HomeBackground />
            </Suspense>
          </div>
          <div className="relative">
            <Outlet />
          </div>
          {DEV_MODE && <TanStackRouterDevtools />}
        </div>
      </AppContext.Provider>
    )
  },
})

function useIsFirstLoad(): React.RefObject<boolean> {
  const isFirstLoad = React.useRef(true)
  const router = useRouter()
  useEffect(() => {
    const unsubscribe = router.subscribe(
      'onResolved',
      () => {
        isFirstLoad.current = false
      },
    )
    return unsubscribe
  }, [router])
  return isFirstLoad
}
