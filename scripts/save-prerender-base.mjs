import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()

const source =
  path.join(
    root,
    'dist',
    'index.html'
  )

const target =
  path.join(
    root,
    'dist',
    '.prerender-base.html'
  )

await fs.copyFile(
  source,
  target
)

console.log(
  'Saved clean prerender base template'
)
