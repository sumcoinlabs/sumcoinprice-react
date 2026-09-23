import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const dist = path.join(root, 'dist')

const homepagePath =
  path.join(dist, 'index.html')

const serverEntry =
  path.join(
    root,
    'dist-server',
    'entry-server.js'
  )

const homepageHtml =
  await fs.readFile(
    homepagePath,
    'utf8'
  )

const serverModule =
  await import(
    pathToFileURL(serverEntry).href
  )

const pages = [
  {
    path: '/about/',
    directory: 'about',
    type: 'AboutPage',
    title:
      'What Is Sumcoin? | SUM Digital Currency & Index',
    description:
      'Learn what Sumcoin (SUM) is, how indexed value, self-custody and peer-to-peer transfer fit together, and how SumcoinPrice provides market context.',
    label:
      'About Sumcoin',
  },
  {
    path: '/index/',
    directory: 'index',
    type: 'WebPage',
    title:
      'Sumcoin Index | How SUM Reference Pricing Works',
    description:
      'Understand the Sumcoin Index, the reference value behind SUM pricing, why an index-based approach differs from a single exchange, and how market data is presented.',
    label:
      'Sumcoin Index',
  },
  {
    path: '/history/',
    directory: 'history',
    type: 'WebPage',
    title:
      'Sumcoin History | SUM Price, ATH & Performance',
    description:
      'Explore Sumcoin price history, SUM/USD and SUM/BTC performance, all-time-high context, long-term market cycles and purchasing-power comparisons.',
    label:
      'Sumcoin History',
  },
  {
    path: '/ecosystem/',
    directory: 'ecosystem',
    type: 'CollectionPage',
    title:
      'Sumcoin Ecosystem | Wallet, Explorer & Network',
    description:
      'Explore the Sumcoin ecosystem, including the Sumcoin wallet, blockchain explorer, network, marketplace and live SUM market data.',
    label:
      'Sumcoin Ecosystem',
  },
]

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
}

function replaceTitle(html, title) {
  return html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${title}</title>`
  )
}

function replaceMeta(
  html,
  attribute,
  key,
  value
) {
  const regex =
    new RegExp(
      `<meta\\b[^>]*${attribute}="${key}"[^>]*>`,
      'i'
    )

  if (!regex.test(html)) {
    throw new Error(
      `Metadata not found: ${attribute}=${key}`
    )
  }

  return html.replace(
    regex,
    (tag) => {
      if (/content="[^"]*"/i.test(tag)) {
        return tag.replace(
          /content="[^"]*"/i,
          `content="${escapeAttribute(value)}"`
        )
      }

      return tag.replace(
        />$/,
        ` content="${escapeAttribute(value)}">`
      )
    }
  )
}

function replaceCanonical(
  html,
  url
) {
  const regex =
    /<link\b[^>]*rel="canonical"[^>]*>/i

  if (!regex.test(html)) {
    throw new Error(
      'Canonical link not found'
    )
  }

  return html.replace(
    regex,
    (tag) =>
      tag.replace(
        /href="[^"]*"/i,
        `href="${url}"`
      )
  )
}

function replaceSiteJsonLd(
  html,
  schema
) {
  const regex =
    /<script id="site-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/i

  if (!regex.test(html)) {
    throw new Error(
      'site-jsonld script not found'
    )
  }

  return html.replace(
    regex,
    `<script id="site-jsonld" type="application/ld+json">${JSON.stringify(schema)}</script>`
  )
}

function stripLiveMarketJsonLd(
  html
) {
  return html.replace(
    /\s*<script id="sumcoin-live-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/i,
    ''
  )
}

function createBlankTemplate(
  html
) {
  const rootOpen =
    '<div id="root">'

  const start =
    html.indexOf(rootOpen)

  const moduleScript =
    html.lastIndexOf(
      '<script type="module"'
    )

  if (
    start < 0 ||
    moduleScript < 0
  ) {
    throw new Error(
      'Could not locate prerendered root'
    )
  }

  const end =
    html.lastIndexOf(
      '</div>',
      moduleScript
    )

  if (end < start) {
    throw new Error(
      'Could not locate end of prerendered root'
    )
  }

  return (
    html.slice(0, start) +
    '<div id="root"></div>' +
    html.slice(end + 6)
  )
}

const buildTimestamp =
  new Date().toISOString()

let template =
  createBlankTemplate(
    homepageHtml
  )

template =
  stripLiveMarketJsonLd(
    template
  )

const rootMarker =
  '<div id="root"></div>'

for (const page of pages) {
  const url =
    `https://sumcoinprice.com${page.path}`

  const pageId =
    `${url}#webpage`

  const breadcrumbId =
    `${url}#breadcrumb`

  const schema = {
    '@context':
      'https://schema.org',

    '@graph': [
      {
        '@type':
          'Organization',

        '@id':
          'https://sumcoinprice.com/#organization',

        name:
          'Sumcoin',

        url:
          'https://sumcoin.org/',

        logo: {
          '@type':
            'ImageObject',

          url:
            'https://sumcoin.org/wp-content/uploads/2019/07/sumcoin_400x400.png',
        },

        sameAs: [
          'https://github.com/sumcoinlabs',
          'https://sumcoinwallet.org/',
          'https://sumexplorer.com/',
          'https://sumcoinmarketplace.com/',
        ],
      },

      {
        '@type':
          'WebSite',

        '@id':
          'https://sumcoinprice.com/#website',

        url:
          'https://sumcoinprice.com/',

        name:
          'SumcoinPrice',

        publisher: {
          '@id':
            'https://sumcoinprice.com/#organization',
        },
      },

      {
        '@type':
          page.type,

        '@id':
          pageId,

        url,

        name:
          page.title,

        description:
          page.description,

        dateModified:
          buildTimestamp,

        isPartOf: {
          '@id':
            'https://sumcoinprice.com/#website',
        },

        about: {
          '@id':
            'https://sumcoinprice.com/#organization',
        },

        breadcrumb: {
          '@id':
            breadcrumbId,
        },
      },

      {
        '@type':
          'BreadcrumbList',

        '@id':
          breadcrumbId,

        itemListElement: [
          {
            '@type':
              'ListItem',

            position: 1,

            name:
              'SumcoinPrice',

            item:
              'https://sumcoinprice.com/',
          },

          {
            '@type':
              'ListItem',

            position: 2,

            name:
              page.label,

            item:
              url,
          },
        ],
      },
    ],
  }

  let output =
    template.replace(
      rootMarker,
      `<div id="root">${serverModule.render(
        page.path
      )}</div>`
    )

  output =
    replaceTitle(
      output,
      page.title
    )

  output =
    replaceMeta(
      output,
      'name',
      'description',
      page.description
    )

  output =
    replaceMeta(
      output,
      'property',
      'og:title',
      page.title
    )

  output =
    replaceMeta(
      output,
      'property',
      'og:description',
      page.description
    )

  output =
    replaceMeta(
      output,
      'property',
      'og:url',
      url
    )

  output =
    replaceMeta(
      output,
      'name',
      'twitter:title',
      page.title
    )

  output =
    replaceMeta(
      output,
      'name',
      'twitter:description',
      page.description
    )

  output =
    replaceCanonical(
      output,
      url
    )

  output =
    replaceSiteJsonLd(
      output,
      schema
    )

  const directory =
    path.join(
      dist,
      page.directory
    )

  await fs.mkdir(
    directory,
    {
      recursive: true,
    }
  )

  await fs.writeFile(
    path.join(
      directory,
      'index.html'
    ),
    output,
    'utf8'
  )

  console.log(
    `Prerendered ${page.path}`
  )
}

const reactUrls = [
  'https://sumcoinprice.com/',
  ...pages.map(
    (page) =>
      `https://sumcoinprice.com${page.path}`
  ),
]

const legacyUrls = [
  'https://sumcoinprice.com/sumbtc/',
  'https://sumcoinprice.com/sum-usdt/',
]

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${reactUrls.map((url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${buildTimestamp}</lastmod>
  </url>`).join('\n\n')}

${legacyUrls.map((url) => `  <url>
    <loc>${url}</loc>
  </url>`).join('\n\n')}

</urlset>
`

await fs.writeFile(
  path.join(
    dist,
    'sitemap.xml'
  ),
  sitemap,
  'utf8'
)

console.log(
  'Generated complete dist sitemap'
)
