import { ErrorBoundary } from 'react-error-boundary'
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom'
import { AddGear } from './component/add-gear.component.js'
import { AddResource } from './component/add-resource.component.js'
import { App } from './component/app.component.js'
import { ApplyForce } from './component/apply-force.component.js'
import { ApplyFriction } from './component/apply-friction.component.js'
import { Configure } from './component/configure.component.js'
import { Index } from './component/index.component.js'
import { Toolbar } from './component/toolbar.component.js'

// TODO cleanup errors
// https://github.com/facebook/react/issues/15069

const router = createBrowserRouter([
  {
    // only relevent during development
    index: true,
    Component: () => <Navigate to="gears" />,
  },
  {
    path: 'gears',
    Component: App,
    children: [
      {
        index: true,
        Component: Index,
      },
      {
        path: 'tools',
        children: [
          {
            index: true,
            Component: Toolbar,
          },
          {
            path: 'add-gear',
            Component: AddGear,
          },
          {
            path: 'add-resource',
            Component: AddResource,
          },
          {
            path: 'apply-force',
            Component: ApplyForce,
          },
          {
            path: 'apply-friction',
            Component: ApplyFriction,
          },
          {
            path: 'configure',
            Component: Configure,
          },
        ],
      },
    ],
  },
])

export function DemoGear() {
  return (
    <ErrorBoundary fallback={<>Error</>}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
