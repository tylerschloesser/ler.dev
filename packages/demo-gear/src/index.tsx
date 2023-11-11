import { createRoot } from 'react-dom/client'
import invariant from 'tiny-invariant'

const DemoGear = () => {
  return <>test</>
}

const container = document.getElementById('app')
invariant(container)
const root = createRoot(container)
root.render(<DemoGear />)
