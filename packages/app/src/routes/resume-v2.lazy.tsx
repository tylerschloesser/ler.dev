import { createLazyFileRoute } from '@tanstack/react-router'
import { ResumeV2 } from '../resume-v2'

export const Route = createLazyFileRoute('/resume-v2')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ResumeV2 />
}
