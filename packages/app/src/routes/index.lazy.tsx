import { createLazyFileRoute } from '@tanstack/react-router'
import { ResumeV1 } from '../resume-v1'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <>
      <ResumeV1 />
    </>
  )
}
