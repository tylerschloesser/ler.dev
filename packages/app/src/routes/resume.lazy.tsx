import { createLazyFileRoute } from '@tanstack/react-router'
import { ResumeV2 } from '../resume'

export const Route = createLazyFileRoute('/resume')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ResumeV2 />
}
