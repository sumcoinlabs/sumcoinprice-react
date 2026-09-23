import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()

const liveMode =
  process.argv.includes(
    '--live'
  )

const routes = [
  {
    path: '/',
    file: 'index.html',
    visiblePrice: true,
  },
  {
    path: '/about/',
    file: 'about/index.html',
  },
  {
    path: '/index/',
    file: 'index/index.html',
    visiblePrice: true,
  },
  {
    path: '/history/',
    file: 'history/index.html',
    visiblePrice: true,
  },
  {
    path: '/ecosystem/',
    file: 'ecosystem/index.html',
  },
  {
    path: '/peer-to-peer/',
    file:
      'peer-to-peer/index.html',
    visiblePrice: true,
  },
  {
    path: '/buy/',
    file: 'buy/index.html',
    visiblePrice: true,
  },
  {
    path: '/calculator/',
    file:
      'calculator/index.html',
    visiblePrice: true,
  },
  {
    path:
      '/sumcoin-vs-bitcoin/',
    file:
      'sumcoin-vs-bitcoin/index.html',
    visiblePrice: true,
  },
]

function assert(
  condition,
  message
) {
  if (!condition) {
    throw new Error(message)
  }
}

async function fetchJson(
  url
) {
  const response =
    await fetch(
      url,
      {
        signal:
          AbortSignal.timeout(
            15000
          ),
        headers: {
          'User-Agent':
            'SumcoinPrice-Audit/1.0',
        },
      }
    )

  assert(
    response.ok,
    `${url} HTTP ${response.status}`
  )

  return response.json()
}

function finite(
  value
) {
  return Number.isFinite(
    Number(value)
  )
}

function canonicalFrom(
  html
) {
  const tag =
    html.match(
      /<link\b[^>]*rel="canonical"[^>]*>/i
    )?.[0]

  return tag
    ?.match(
      /href="([^"]+)"/i
    )?.[1] ??
    ''
}

function descriptionFrom(
  html
) {
  const tag =
    html.match(
      /<meta\b[^>]*name="description"[^>]*>/i
    )?.[0]

  return tag
    ?.match(
      /content="([^"]*)"/i
    )?.[1] ??
    ''
}

function titleFrom(
  html
) {
  return html.match(
    /<title>([\s\S]*?)<\/title>/i
  )?.[1]?.trim() ?? ''
}

function marketStateFrom(
  html
) {
  const match =
    html.match(
      /<script id="sumcoin-market-state" type="application\/json">([\s\S]*?)<\/script>/i
    )

  assert(
    match,
    'Missing market state'
  )

  return JSON.parse(
    match[1]
  )
}

function visibleHtml(
  html
) {
  return html
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      ''
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      ''
    )
}

async function auditMarketApi() {
  console.log(
    '\n=== MARKET API ==='
  )

  const market =
    await fetchJson(
      'https://sumcoinprice.com/market.php'
    )

  assert(
    market.success,
    'market.php success=false'
  )

  assert(
    finite(market.price) &&
    Number(market.price) > 0,
    'Invalid market price'
  )

  assert(
    finite(market.market_cap) &&
    Number(market.market_cap) > 0,
    'Invalid market cap'
  )

  assert(
    finite(market.volume_24h) &&
    Number(market.volume_24h) >= 0,
    'Invalid 24h volume'
  )

  assert(
    finite(
      market.circulating_supply
    ) &&
    Number(
      market.circulating_supply
    ) > 0,
    'Invalid circulating supply'
  )

  assert(
    finite(
      market.max_supply
    ) &&
    Number(
      market.max_supply
    ) > 0,
    'Invalid maximum supply'
  )

  console.log(
    `PASS price $${Number(
      market.price
    ).toFixed(2)}`
  )

  console.log(
    `PASS market cap ${market.market_cap}`
  )

  console.log(
    `PASS volume ${market.volume_24h}`
  )

  console.log(
    `PASS circulating ${market.circulating_supply}`
  )

  console.log(
    `PASS max supply ${market.max_supply}`
  )
}

async function auditHistoryApi() {
  console.log(
    '\n=== HISTORY API ==='
  )

  const cases = [
    ['1d', 'usd'],
    ['1y', 'usd'],
    ['all', 'usd'],
    ['1d', 'btc'],
    ['1y', 'btc'],
    ['all', 'btc'],
  ]

  for (
    const [
      range,
      pair,
    ] of cases
  ) {
    const url =
      `https://sumcoinprice.com/api/history.php?range=${range}&pair=${pair}`

    const json =
      await fetchJson(url)

    assert(
      json.success,
      `${pair}/${range} unsuccessful`
    )

    assert(
      finite(
        json.latest?.price
      ) &&
      Number(
        json.latest.price
      ) > 0,
      `${pair}/${range} invalid latest`
    )

    assert(
      Array.isArray(
        json.data
      ) &&
      json.data.length > 0,
      `${pair}/${range} no history`
    )

    for (
      const field
      of [
        'open',
        'close',
        'high',
        'low',
        'change',
        'change_percent',
      ]
    ) {
      assert(
        finite(
          json.period?.[field]
        ),
        `${pair}/${range} bad ${field}`
      )
    }

    console.log(
      `PASS ${pair.toUpperCase()} ${range} (${json.data.length} points)`
    )
  }
}

async function auditHtml(
  html,
  route
) {
  const h1Count =
    (
      html.match(
        /<h1(?:\s|>)/gi
      ) ??
      []
    ).length

  assert(
    h1Count === 1,
    `${route.path} H1 count ${h1Count}`
  )

  const title =
    titleFrom(html)

  assert(
    title,
    `${route.path} missing title`
  )

  const description =
    descriptionFrom(html)

  assert(
    description.length >= 70,
    `${route.path} weak description`
  )

  const canonical =
    canonicalFrom(html)

  const expected =
    `https://sumcoinprice.com${route.path}`

  assert(
    canonical === expected,
    `${route.path} canonical ${canonical}`
  )

  assert(
    html.includes(
      'ExchangeRateSpecification'
    ),
    `${route.path} missing exchange-rate JSON-LD`
  )

  const market =
    marketStateFrom(html)

  assert(
    finite(
      market.price
    ) &&
    Number(
      market.price
    ) > 0,
    `${route.path} invalid embedded price`
  )

  if (
    route.visiblePrice
  ) {
    const formatted =
      new Intl.NumberFormat(
        'en-US',
        {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      ).format(
        Number(
          market.price
        )
      )

    assert(
      visibleHtml(html)
        .includes(formatted),
      `${route.path} price not visible in SSR HTML`
    )
  }

  console.log(
    `PASS ${route.path} | ${title}`
  )
}

async function auditDist() {
  console.log(
    '\n=== GENERATED PAGES ==='
  )

  for (
    const route
    of routes
  ) {
    const html =
      await fs.readFile(
        path.join(
          root,
          'dist',
          route.file
        ),
        'utf8'
      )

    await auditHtml(
      html,
      route
    )
  }

  const sitemap =
    await fs.readFile(
      path.join(
        root,
        'dist',
        'sitemaps.xml'
      ),
      'utf8'
    )

  const urls =
    [
      ...sitemap.matchAll(
        /<loc>([^<]+)<\/loc>/g
      ),
    ].map(
      (match) =>
        match[1]
    )

  assert(
    new Set(urls).size === 11,
    `sitemaps.xml has ${new Set(urls).size} unique URLs`
  )

  assert(
    urls.includes(
      'https://sumcoinprice.com/peer-to-peer/'
    ),
    'Peer-to-peer missing from sitemap'
  )

  const standardSitemap =
    await fs.readFile(
      path.join(
        root,
        'dist',
        'sitemap.xml'
      ),
      'utf8'
    )

  const standardUrls =
    [
      ...standardSitemap.matchAll(
        /<loc>([^<]+)<\/loc>/g
      ),
    ].map(
      (match) =>
        match[1]
    )

  assert(
    standardSitemap.includes(
      '<urlset'
    ),
    'sitemap.xml is not a URL set'
  )

  assert(
    new Set(
      standardUrls
    ).size === 11,
    `sitemap.xml has ${new Set(standardUrls).size} unique URLs`
  )

  assert(
    [...new Set(urls)]
      .sort()
      .join('\n') ===
    [...new Set(standardUrls)]
      .sort()
      .join('\n'),
    'sitemap.xml and sitemaps.xml differ'
  )

  console.log(
    'PASS sitemaps.xml = 11 URLs'
  )

  console.log(
    'PASS sitemap.xml = 11 URLs'
  )

  console.log(
    'PASS both sitemap files contain the same URLs'
  )
}

async function auditLive() {
  if (!liveMode) {
    return
  }

  console.log(
    '\n=== LIVE PAGES ==='
  )

  for (
    const route
    of routes
  ) {
    const url =
      `https://sumcoinprice.com${route.path}`

    const response =
      await fetch(
        url,
        {
          signal:
            AbortSignal.timeout(
              15000
            ),
          headers: {
            'User-Agent':
              'Mozilla/5.0 SumcoinPrice-Audit',
          },
        }
      )

    assert(
      response.ok,
      `${url} HTTP ${response.status}`
    )

    await auditHtml(
      await response.text(),
      route
    )
  }

  const sitemapResponse =
    await fetch(
      'https://sumcoinprice.com/sitemaps.xml'
    )

  assert(
    sitemapResponse.ok,
    'Live sitemaps.xml unavailable'
  )

  console.log(
    'PASS live sitemaps.xml'
  )
}

async function auditExternalLinks() {
  console.log(
    '\n=== ECOSYSTEM LINKS ==='
  )

  const urls = [
    'https://sumcoinwallet.org/',
    'https://sumexplorer.com/',
    'https://sumcoinmarketplace.com/',
    'https://www.sumcoin.org/',
    'https://www.sumcoin.org/migrations/',
  ]

  for (
    const url
    of urls
  ) {
    try {
      const response =
        await fetch(
          url,
          {
            redirect: 'follow',
            signal:
              AbortSignal.timeout(
                15000
              ),
            headers: {
              'User-Agent':
                'Mozilla/5.0 SumcoinPrice-Audit',
            },
          }
        )

      if (
        response.status >= 400
      ) {
        console.warn(
          `WARN ${url} HTTP ${response.status}`
        )
      } else {
        console.log(
          `PASS ${url} HTTP ${response.status}`
        )
      }
    } catch (error) {
      console.warn(
        `WARN ${url}: ${error.message}`
      )
    }
  }
}

await auditMarketApi()
await auditHistoryApi()
await auditDist()
await auditExternalLinks()
await auditLive()

console.log(
  '\n=== AUDIT COMPLETE ==='
)
