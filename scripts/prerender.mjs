import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()

const htmlPath =
  path.join(
    root,
    'dist',
    'index.html'
  )

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

let market = null

try {
  const marketResponse =
    await fetch(
      'https://sumcoinprice.com/market.php',
      {
        headers: {
          'User-Agent':
            'SumcoinPrice-Prerender/2.0',
        },
      }
    )

  if (!marketResponse.ok) {
    throw new Error(
      `Market endpoint HTTP ${marketResponse.status}`
    )
  }

  const json =
    await marketResponse.json()

  if (
    !json.success ||
    !Number.isFinite(
      Number(json.price)
    )
  ) {
    throw new Error(
      'Invalid market data'
    )
  }

  market = {
    ...json,
    price:
      Number(json.price),
    market_cap:
      Number(
        json.market_cap
      ) || 0,
    volume_24h:
      Number(
        json.volume_24h
      ) || 0,
    circulating_supply:
      Number(
        json.circulating_supply
      ) || 0,
    max_supply:
      Number(
        json.max_supply
      ) || 0,
  }

  try {
    const btcResponse =
      await fetch(
        'https://sumcoinprice.com/api/history.php?range=1d&pair=btc',
        {
          headers: {
            'User-Agent':
              'SumcoinPrice-Prerender/2.0',
          },
        }
      )

    if (btcResponse.ok) {
      const btc =
        await btcResponse.json()

      const ratio =
        Number(
          btc.latest?.price
        )

      if (
        btc.success &&
        Number.isFinite(ratio)
      ) {
        market.btc_ratio =
          ratio
      }
    }
  } catch {
    // SUM/USD market data is
    // still usable without BTC.
  }

  console.log(
    `Fetched SUM market data: $${market.price.toFixed(2)}`
  )
} catch (error) {
  console.warn(
    'Market prerender unavailable:',
    error.message
  )
}

const appHtml =
  serverModule.render(
    '/',
    market
  )

const rootMarker =
  '<div id="root"></div>'

if (!html.includes(rootMarker)) {
  throw new Error(
    'Could not find empty #root'
  )
}

let output =
  html.replace(
    rootMarker,
    `<div id="root">${appHtml}</div>`
  )

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
}

function replaceTitle(
  source,
  value
) {
  return source.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${value}</title>`
  )
}

function replaceMeta(
  source,
  attribute,
  key,
  value
) {
  const regex =
    new RegExp(
      `<meta\\b[^>]*${attribute}="${key}"[^>]*>`,
      'i'
    )

  if (!regex.test(source)) {
    return source
  }

  return source.replace(
    regex,
    (tag) =>
      tag.replace(
        /content="[^"]*"/i,
        `content="${escapeAttribute(value)}"`
      )
  )
}

if (market) {
  const priceText =
    market.price.toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )

  const displayPrice =
    `$${priceText}`

  const title =
    `Sumcoin Price Today: ${displayPrice} | Live SUM Index`

  const description =
    `Sumcoin (SUM) price today is ${displayPrice} USD. View the live Sumcoin Index, historical SUM charts, market cap, supply, volume and network data.`

  output =
    replaceTitle(
      output,
      title
    )

  for (const [
    attribute,
    key,
    value,
  ] of [
    [
      'name',
      'description',
      description,
    ],
    [
      'property',
      'og:title',
      title,
    ],
    [
      'property',
      'og:description',
      description,
    ],
    [
      'name',
      'twitter:title',
      title,
    ],
    [
      'name',
      'twitter:description',
      description,
    ],
  ]) {
    output =
      replaceMeta(
        output,
        attribute,
        key,
        value
      )
  }

  const stateJson =
    JSON.stringify(market)
      .replaceAll(
        '<',
        '\\u003c'
      )

  const stateTag =
    `<script id="sumcoin-market-state" type="application/json">${stateJson}</script>`

  const jsonLd = {
    '@context':
      'https://schema.org',

    '@graph': [
      {
        '@type':
          'ExchangeRateSpecification',

        '@id':
          'https://sumcoinprice.com/#sum-usd-rate',

        name:
          'Sumcoin to U.S. Dollar Reference Rate',

        currency:
          'SUM',

        currentExchangeRate: {
          '@type':
            'UnitPriceSpecification',

          price:
            market.price,

          priceCurrency:
            'USD',
        },
      },

      {
        '@type':
          'Dataset',

        '@id':
          'https://sumcoinprice.com/#live-market-data',

        name:
          `Sumcoin Live Market Data - ${displayPrice}`,

        description:
          `Current Sumcoin index price is ${displayPrice} USD, with market capitalization, volume and supply data.`,

        url:
          'https://sumcoinprice.com/',

        dateModified:
          market.updated_at,

        variableMeasured: [
          {
            '@type':
              'PropertyValue',

            name:
              'SUM price in USD',

            value:
              market.price,

            unitText:
              'USD',
          },

          {
            '@type':
              'PropertyValue',

            name:
              'Market capitalization',

            value:
              market.market_cap,

            unitText:
              'USD',
          },

          {
            '@type':
              'PropertyValue',

            name:
              '24-hour volume',

            value:
              market.volume_24h,

            unitText:
              'USD',
          },

          {
            '@type':
              'PropertyValue',

            name:
              'Circulating supply',

            value:
              market.circulating_supply,

            unitText:
              'SUM',
          },

          {
            '@type':
              'PropertyValue',

            name:
              'Maximum supply',

            value:
              market.max_supply,

            unitText:
              'SUM',
          },
        ],
      },
    ],
  }

  const jsonLdTag =
    `<script id="sumcoin-live-jsonld" type="application/ld+json">${JSON.stringify(jsonLd)}</script>`

  output =
    output.replace(
      '</head>',
      `  ${stateTag}
  ${jsonLdTag}
</head>`
    )
}

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
  'Prerendered homepage with live SUM market data'
)
