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
  {
    path: '/buy/',
    directory: 'buy',
    type: 'WebPage',
    title:
      'How to Buy Sumcoin (SUM) | Wallet & Acquisition Guide',
    description:
      'Learn how to get Sumcoin (SUM), check the live Sumcoin Index price, review official acquisition resources and move SUM to a self-custody wallet.',
    label:
      'How to Buy Sumcoin',
  },
  {
    path: '/calculator/',
    directory: 'calculator',
    type: 'WebPage',
    title:
      'Sumcoin Calculator | Convert SUM to USD',
    description:
      'Use the live Sumcoin calculator to convert SUM to U.S. dollars using the current Sumcoin Index reference rate.',
    label:
      'Sumcoin Calculator',
  },
  {
    path: '/sumcoin-vs-bitcoin/',
    directory: 'sumcoin-vs-bitcoin',
    type: 'WebPage',
    title:
      'Sumcoin vs Bitcoin | SUM/BTC Price & Comparison',
    description:
      'Compare Sumcoin and Bitcoin with the live SUM/BTC ratio, SUM Index price, historical performance and differences in price formation.',
    label:
      'Sumcoin vs Bitcoin',
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

function extractMarketState(
  html
) {
  const match =
    html.match(
      /<script id="sumcoin-market-state" type="application\/json">([\s\S]*?)<\/script>/i
    )

  if (!match) {
    return null
  }

  try {
    return JSON.parse(
      match[1]
    )
  } catch {
    return null
  }
}

function formatPrice(value) {
  if (
    !Number.isFinite(
      Number(value)
    )
  ) {
    return null
  }

  return `$${Number(
    value
  ).toLocaleString(
    'en-US',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`
}

function seoForPage(
  page,
  market
) {
  const price =
    formatPrice(
      market?.price
    )

  const btcRatio =
    Number.isFinite(
      Number(
        market?.btc_ratio
      )
    )
      ? Number(
          market.btc_ratio
        ).toFixed(8)
      : null

  if (!price) {
    return {
      title:
        page.title,
      description:
        page.description,
    }
  }

  switch (page.path) {
    case '/index/':
      return {
        title:
          `Sumcoin Index Price: ${price} | How SUM Works`,
        description:
          `The current Sumcoin Index price is ${price} USD. Learn how SUM reference pricing works and view live market cap, volume and supply data.`,
      }

    case '/history/':
      return {
        title:
          `Sumcoin Price History | SUM ${price} Today`,
        description:
          `Sumcoin (SUM) is ${price} USD today. Explore SUM price history, SUM/BTC performance, market cycles and long-term comparisons.`,
      }

    case '/buy/':
      return {
        title:
          `How to Buy Sumcoin (SUM) | Price ${price}`,
        description:
          `Sumcoin (SUM) is ${price} USD today. Learn how to get SUM, review official acquisition resources and move Sumcoin to a self-custody wallet.`,
      }

    case '/calculator/':
      return {
        title:
          `Sumcoin Calculator: 1 SUM = ${price} | SUM to USD`,
        description:
          `1 Sumcoin (SUM) is ${price} USD at the current Sumcoin Index rate. Convert any amount of SUM to U.S. dollars with the live calculator.`,
      }

    case '/sumcoin-vs-bitcoin/':
      return {
        title:
          `Sumcoin vs Bitcoin | SUM ${price} Today`,
        description:
          btcRatio
            ? `Sumcoin (SUM) is ${price} USD and ${btcRatio} BTC today. Compare SUM with Bitcoin using live and historical market data.`
            : `Sumcoin (SUM) is ${price} USD today. Compare SUM with Bitcoin using live and historical market data.`,
      }

    case '/about/':
      return {
        title:
          page.title,
        description:
          `Sumcoin (SUM) is ${price} USD today. Learn what Sumcoin is, how indexed value works, and how SUM supports peer-to-peer transfer and self-custody.`,
      }

    case '/ecosystem/':
      return {
        title:
          page.title,
        description:
          `Sumcoin (SUM) is ${price} USD today. Explore the Sumcoin wallet, blockchain explorer, network, marketplace and live market-data ecosystem.`,
      }

    default:
      return {
        title:
          page.title,
        description:
          page.description,
      }
  }
}


function createBlankTemplate(
  html
) {
  const rootOpen =
    '<div id="root">'

  const start =
    html.indexOf(rootOpen)

  if (start < 0) {
    throw new Error(
      'Could not locate prerendered root'
    )
  }

  /*
   * Find the matching closing </div> for #root.
   * Do not rely on the Vite module script position,
   * because Vite places production scripts in <head>.
   */
  const tokenRegex =
    /<div\b[^>]*>|<\/div>/gi

  tokenRegex.lastIndex = start

  let depth = 0
  let end = -1
  let match

  while (
    (match = tokenRegex.exec(html)) !== null
  ) {
    if (
      match[0]
        .toLowerCase()
        .startsWith('<div')
    ) {
      depth += 1
    } else {
      depth -= 1

      if (depth === 0) {
        end = tokenRegex.lastIndex
        break
      }
    }
  }

  if (end < 0) {
    throw new Error(
      'Could not locate end of prerendered root'
    )
  }

  return (
    html.slice(0, start) +
    '<div id="root"></div>' +
    html.slice(end)
  )
}

const buildTimestamp =
  new Date().toISOString()

const market =
  extractMarketState(
    homepageHtml
  )

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

  const seo =
    seoForPage(
      page,
      market
    )

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
          seo.title,

        description:
          seo.description,

        dateModified:
          market?.updated_at ||
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

  if (market) {
    schema['@graph'].push(
      {
        '@type':
          'ExchangeRateSpecification',

        '@id':
          `${url}#sum-usd-rate`,

        name:
          'Sumcoin to U.S. Dollar Reference Rate',

        currency:
          'SUM',

        currentExchangeRate: {
          '@type':
            'UnitPriceSpecification',

          price:
            Number(
              market.price
            ),

          priceCurrency:
            'USD',
        },
      },

      {
        '@type':
          'Dataset',

        '@id':
          `${url}#sumcoin-live-market-data`,

        name:
          'Sumcoin Live Market Data',

        description:
          seo.description,

        url,

        dateModified:
          market.updated_at ||
          buildTimestamp,

        variableMeasured: [
          {
            '@type':
              'PropertyValue',

            name:
              'SUM price in USD',

            value:
              Number(
                market.price
              ),

            unitText:
              'USD',
          },

          {
            '@type':
              'PropertyValue',

            name:
              'Market capitalization',

            value:
              Number(
                market.market_cap
              ),

            unitText:
              'USD',
          },

          {
            '@type':
              'PropertyValue',

            name:
              '24-hour volume',

            value:
              Number(
                market.volume_24h
              ),

            unitText:
              'USD',
          },
        ],
      }
    )
  }

  let output =
    template.replace(
      rootMarker,
      `<div id="root">${serverModule.render(
        page.path,
        market
      )}</div>`
    )

  output =
    replaceTitle(
      output,
      seo.title
    )

  output =
    replaceMeta(
      output,
      'name',
      'description',
      seo.description
    )

  output =
    replaceMeta(
      output,
      'property',
      'og:title',
      seo.title
    )

  output =
    replaceMeta(
      output,
      'property',
      'og:description',
      seo.description
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
      seo.title
    )

  output =
    replaceMeta(
      output,
      'name',
      'twitter:description',
      seo.description
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
