import * as fs from 'fs'
import * as path from 'path'

export function getAssetPath(): string {
  return path.join(__dirname, '../../ty/dist')
}

interface Manifest {
  'index.html': string
}

export function getDefaultRootObject(): string {
  const manifest: Manifest = JSON.parse(
    fs.readFileSync(path.join(getAssetPath(), 'manifest.json'), 'utf8'),
  )
  return manifest['index.html']
}
