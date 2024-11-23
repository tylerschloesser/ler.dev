import {
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

const DEV_MODE = false

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {DEV_MODE && <TanStackRouterDevtools />}
    </>
  ),
})
