import { createFileRoute } from '@tanstack/react-router'
import { ResumeV2 } from '../resume-v2'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <>
      <ResumeV2 />
    </>
  )
}
