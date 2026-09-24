import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { spawn } from 'node:child_process'

const root = process.cwd()
const dist = path.join(root, 'dist')
const socialDir = path.join(dist, 'social')

const chrome =
  process.env.CHROME_PATH ||
  '/usr/bin/google-chrome-stable'

const pages = [
  ['/', 'home'],
  ['/about/', 'about'],
  ['/index/', 'index'],
  ['/history/', 'history'],
  ['/ecosystem/', 'ecosystem'],
  ['/peer-to-peer/', 'peer-to-peer'],
  ['/buy/', 'buy'],
  ['/calculator/', 'calculator'],
  [
    '/sumcoin-vs-bitcoin/',
    'sumcoin-vs-bitcoin',
  ],
]

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function resolveFile(url) {
  let pathname =
    decodeURIComponent(
      (url || '/').split('?')[0]
    )

  if (
    pathname === '/' ||
    pathname.endsWith('/')
  ) {
    pathname += 'index.html'
  }

  const file =
    path.resolve(
      dist,
      pathname.replace(/^\/+/, '')
    )

  const allowed =
    path.resolve(dist) + path.sep

  if (!file.startsWith(allowed)) {
    return null
  }

  return file
}

function runChrome(args) {
  return new Promise(
    (resolve, reject) => {
      const child =
        spawn(
          chrome,
          args,
          {
            stdio: [
              'ignore',
              'pipe',
              'pipe',
            ],
          }
        )

      let stderr = ''

      child.stderr.on(
        'data',
        chunk => {
          stderr +=
            chunk.toString()
        }
      )

      const timer =
        setTimeout(
          () => {
            child.kill('SIGKILL')

            reject(
              new Error(
                'Chrome screenshot timed out'
              )
            )
          },
          30000
        )

      child.on(
        'error',
        error => {
          clearTimeout(timer)
          reject(error)
        }
      )

      child.on(
        'exit',
        code => {
          clearTimeout(timer)

          if (code === 0) {
            resolve()
            return
          }

          reject(
            new Error(
              `Chrome exited ${code}\n${stderr}`
            )
          )
        }
      )
    }
  )
}

await fs.access(chrome)

await fs.mkdir(
  socialDir,
  {
    recursive: true,
  }
)

const server =
  http.createServer(
    async (req, res) => {
      try {
        const file =
          resolveFile(req.url)

        if (!file) {
          res.writeHead(403)
          res.end('Forbidden')
          return
        }

        const body =
          await fs.readFile(file)

        const ext =
          path.extname(file)
            .toLowerCase()

        res.writeHead(
          200,
          {
            'Content-Type':
              types[ext] ||
              'application/octet-stream',

            'Cache-Control':
              'no-store',
          }
        )

        res.end(body)

      } catch {
        res.writeHead(404)
        res.end('Not found')
      }
    }
  )

await new Promise(
  resolve => {
    server.listen(
      0,
      '127.0.0.1',
      resolve
    )
  }
)

const address =
  server.address()

if (
  !address ||
  typeof address === 'string'
) {
  throw new Error(
    'Could not determine local server port'
  )
}

const base =
  `http://127.0.0.1:${address.port}`

try {
  for (
    const [route, name]
    of pages
  ) {
    const target =
      path.join(
        socialDir,
        `${name}.png`
      )

    console.log(
      `Capturing ${route} ...`
    )

    await runChrome([
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      '--virtual-time-budget=2500',
      `--screenshot=${target}`,
      `${base}${route}`,
    ])

    const stat =
      await fs.stat(target)

    if (stat.size < 10000) {
      throw new Error(
        `${name}.png is suspiciously small`
      )
    }

    console.log(
      `PASS ${route} -> social/${name}.png (${Math.round(
        stat.size / 1024
      )} KB)`
    )
  }

} finally {
  await new Promise(
    resolve =>
      server.close(resolve)
  )
}

console.log(
  'ACTUAL PAGE SCREENSHOTS GENERATED'
)
