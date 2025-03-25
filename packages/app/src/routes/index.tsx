import { createFileRoute } from '@tanstack/react-router'
import { Resume } from '../resume'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <>
      <Resume />
    </>
  )
}
