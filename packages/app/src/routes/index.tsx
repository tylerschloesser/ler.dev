import {
  Link,
  createFileRoute,
} from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <>
      <div className="w-dvw h-dvh flex items-center justify-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-center">ty.ler.dev</h1>
          <Link
            to="/resume"
            className="block border p-2 rounded min-w-40 text-center shadow"
          >
            Resume
          </Link>
        </div>
      </div>
    </>
  )
}
