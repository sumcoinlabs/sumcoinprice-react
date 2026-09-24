import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const root = process.cwd()

const dist =
  path.join(
    root,
    'dist'
  )

const base =
  path.join(
    dist,
    '.prerender-base.html'
  )

const homepage =
  path.join(
    dist,
    'index.html'
  )

const ssr =
  path.join(
    root,
    'dist-server',
    'entry-server.js'
  )

try {
  await fs.access(base)
} catch {
  throw new Error(
    'Missing dist/.prerender-base.html. Run npm run build first.'
  )
}

try {
  await fs.access(ssr)
} catch {
  throw new Error(
    'Missing dist-server/entry-server.js. Run npm run build first.'
  )
}

/*
 * Restore the clean Vite-generated HTML shell.
 * The existing JS/CSS bundles remain untouched.
 */
await fs.copyFile(
  base,
  homepage
)

/*
 * Re-render only HTML + metadata + JSON-LD
 * using the existing SSR bundle.
 */
execFileSync(
  process.execPath,
  [
    'scripts/prerender.mjs',
  ],
  {
    cwd: root,
    stdio: 'inherit',
  }
)

execFileSync(
  process.execPath,
  [
    'scripts/prerender-pages.mjs',
  ],
  {
    cwd: root,
    stdio: 'inherit',
  }
)

/*
 * Regenerate the actual-page social preview
 * screenshots after the fresh market data has
 * been rendered into the HTML.
 */
execFileSync(
  process.execPath,
  [
    'scripts/generate-social-previews.mjs',
  ],
  {
    cwd: root,
    stdio: 'inherit',
  }
)

console.log(
  'Live Sumcoin SEO HTML and social previews refreshed'
)
