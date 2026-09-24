import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const dist =
  path.join(
    process.cwd(),
    'dist'
  )

const routes = [
  ['/', 'index.html', 'home'],
  [
    '/about/',
    'about/index.html',
    'about',
  ],
  [
    '/index/',
    'index/index.html',
    'index',
  ],
  [
    '/history/',
    'history/index.html',
    'history',
  ],
  [
    '/ecosystem/',
    'ecosystem/index.html',
    'ecosystem',
  ],
  [
    '/peer-to-peer/',
    'peer-to-peer/index.html',
    'peer-to-peer',
  ],
  [
    '/buy/',
    'buy/index.html',
    'buy',
  ],
  [
    '/calculator/',
    'calculator/index.html',
    'calculator',
  ],
  [
    '/sumcoin-vs-bitcoin/',
    'sumcoin-vs-bitcoin/index.html',
    'sumcoin-vs-bitcoin',
  ],
]

function fail(message) {
  throw new Error(message)
}

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  )
}

function getMeta(
  html,
  attribute,
  key
) {
  const regex =
    new RegExp(
      `<meta\\b[^>]*${attribute}="${escapeRegex(
        key
      )}"[^>]*>`,
      'i'
    )

  const tag =
    html.match(regex)?.[0]

  return (
    tag?.match(
      /content="([^"]*)"/i
    )?.[1] ||
    null
  )
}

function pngDimensions(buffer) {
  const signature =
    buffer
      .subarray(0, 8)
      .toString('hex')

  if (
    signature !==
    '89504e470d0a1a0a'
  ) {
    fail(
      'Invalid PNG signature'
    )
  }

  return {
    width:
      buffer.readUInt32BE(16),

    height:
      buffer.readUInt32BE(20),
  }
}

const hashes =
  new Set()

console.log(
  '=== SOCIAL PREVIEW AUDIT ==='
)

for (
  const [
    route,
    htmlFile,
    imageName,
  ]
  of routes
) {
  const html =
    await fs.readFile(
      path.join(
        dist,
        htmlFile
      ),
      'utf8'
    )

  const base =
    `https://sumcoinprice.com/social/${imageName}.png`

  const versioned =
    new RegExp(
      `^${escapeRegex(base)}\\?v=\\d+$`
    )

  const ogImage =
    getMeta(
      html,
      'property',
      'og:image'
    )

  const secureImage =
    getMeta(
      html,
      'property',
      'og:image:secure_url'
    )

  const twitterImage =
    getMeta(
      html,
      'name',
      'twitter:image'
    )

  if (
    !versioned.test(
      ogImage || ''
    )
  ) {
    fail(
      `${route}: og:image is not versioned: ${ogImage}`
    )
  }

  if (
    secureImage !== ogImage
  ) {
    fail(
      `${route}: og:image:secure_url differs`
    )
  }

  if (
    twitterImage !== ogImage
  ) {
    fail(
      `${route}: twitter:image differs`
    )
  }

  if (
    getMeta(
      html,
      'property',
      'og:image:width'
    ) !== '1200'
  ) {
    fail(
      `${route}: incorrect width metadata`
    )
  }

  if (
    getMeta(
      html,
      'property',
      'og:image:height'
    ) !== '630'
  ) {
    fail(
      `${route}: incorrect height metadata`
    )
  }

  if (
    getMeta(
      html,
      'property',
      'og:image:type'
    ) !== 'image/png'
  ) {
    fail(
      `${route}: incorrect image type`
    )
  }

  if (
    !getMeta(
      html,
      'property',
      'og:image:alt'
    )
  ) {
    fail(
      `${route}: missing OG image alt`
    )
  }

  if (
    !getMeta(
      html,
      'name',
      'twitter:image:alt'
    )
  ) {
    fail(
      `${route}: missing Twitter image alt`
    )
  }

  const image =
    await fs.readFile(
      path.join(
        dist,
        'social',
        `${imageName}.png`
      )
    )

  const {
    width,
    height,
  } =
    pngDimensions(image)

  if (
    width !== 1200 ||
    height !== 630
  ) {
    fail(
      `${route}: image is ${width}x${height}`
    )
  }

  if (
    image.length <
      10000
  ) {
    fail(
      `${route}: screenshot suspiciously small`
    )
  }

  hashes.add(
    crypto
      .createHash('sha256')
      .update(image)
      .digest('hex')
  )

  console.log(
    `PASS ${route} -> ${ogImage} (${Math.round(
      image.length / 1024
    )} KB)`
  )
}

if (
  hashes.size !==
  routes.length
) {
  fail(
    `Expected ${routes.length} distinct previews; found ${hashes.size}`
  )
}

console.log(
  `PASS: ${hashes.size} distinct actual-page previews`
)

console.log(
  'PASS: all social image URLs are cache-versioned'
)

console.log(
  'SOCIAL PREVIEW AUDIT COMPLETE'
)
