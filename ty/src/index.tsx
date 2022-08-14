import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'

const str: string = 'hi'
console.log(str)

const root = createRoot(document.getElementById('app')!)
root.render(<App />)
