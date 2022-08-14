import React from 'react'
import { createRoot } from 'react-dom/client'

const str: string = 'hi'
console.log(str)

const App = () => {
  return <div>hello world</div>
}

const root = createRoot(document.getElementById('app')!)
root.render(<App />)
