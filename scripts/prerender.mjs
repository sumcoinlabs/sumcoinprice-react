import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()

const htmlPath =
  path.join(root, 'dist', 'index.html')

const serverEntry =
  path.join(
    root,
    'dist-server',
    'entry-server.js'
  )

const html =
  await fs.readFile(
    htmlPath,
    'utf8'
  )

const serverModule =
  await import(
    pathToFileURL(serverEntry).href
  )

const appHtml =
  serverModule.render()

const marker =
  '<div id="root"></div>'

if (!html.includes(marker)) {
  throw new Error(
    'Could not find empty #root in dist/index.html'
  )
}

const output =
  html.replace(
    marker,
    `<div id="root">${appHtml}</div>`
  )

const tempPath =
  `${htmlPath}.tmp`

await fs.writeFile(
  tempPath,
  output,
  'utf8'
)

await fs.rename(
  tempPath,
  htmlPath
)

console.log(
  'Prerendered React markup into dist/index.html'
)
