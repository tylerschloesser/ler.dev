import { createLazyFileRoute } from '@tanstack/react-router'
import { Resume } from '../resume'

export const Route = createLazyFileRoute('/resume')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Resume />
}
