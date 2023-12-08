import { Navigate } from 'react-router-dom'
import { RouteObject } from 'react-router-dom'
import { AddResource } from './component/add-resource.component.js'
import { App } from './component/app.component.js'
import { ApplyForce } from './component/apply-force.component.js'
import { ApplyFriction } from './component/apply-friction.component.js'
import { AddBelt } from './component/build-belt.component.js'
import { AddGear } from './component/build-gear.component.js'
import { Configure } from './component/configure.component.js'
import { Delete } from './component/delete.component.js'
import { Index } from './component/index.component.js'
import { Toolbar } from './component/toolbar.component.js'

export const routes: RouteObject[] = [
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
            path: 'build-gear',
            Component: AddGear,
          },
          {
            path: 'add-resource',
            Component: AddResource,
          },
          {
            path: 'build-belt',
            Component: AddBelt,
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
          {
            path: 'delete',
            Component: Delete,
          },
        ],
      },
    ],
  },
]
