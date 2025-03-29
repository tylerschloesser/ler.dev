import {
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import React, { Suspense } from 'react'

const DEV_MODE = false

const HomeBackground = React.lazy(
  () => import('../home-background.tsx'),
)

export const Route = createRootRoute({
  component: () => (
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
  ),
})
