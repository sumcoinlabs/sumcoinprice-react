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

const rootMarker =
  '<div id="root"></div>'

if (!html.includes(rootMarker)) {
  throw new Error(
    'Could not find empty #root in dist/index.html'
  )
}

let output =
  html.replace(
    rootMarker,
    `<div id="root">${appHtml}</div>`
  )


/*
 * Fetch current Sumcoin market data so the
 * initial HTML response contains the same
 * live market information Google would
 * otherwise only see after JavaScript runs.
 */

let market = null

try {

  const response =
    await fetch(
      'https://sumcoinprice.com/market.php',
      {
        headers: {
          'User-Agent':
            'SumcoinPrice-Prerender/1.0',
        },
      }
    )

  if (!response.ok) {
    throw new Error(
      `Market endpoint HTTP ${response.status}`
    )
  }

  const json =
    await response.json()

  if (
    !json.success ||
    !Number.isFinite(
      Number(json.price)
    )
  ) {
    throw new Error(
      'Invalid market data returned'
    )
  }

  market = json

  console.log(
    `Fetched SUM market data: $${Number(
      market.price
    ).toFixed(2)}`
  )

} catch (error) {

  console.warn(
    'Market JSON-LD not injected:',
    error.message
  )

}


/*
 * Inject live market JSON-LD into <head>.
 */

if (market) {

  const jsonLd = {

    '@context':
      'https://schema.org',

    '@graph': [

      {
        '@type':
          'ExchangeRateSpecification',

        '@id':
          'https://sumcoinprice.com/app/#sum-usd-rate',

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
          'https://sumcoinprice.com/app/#live-market-data',

        name:
          'Sumcoin Live Market Data',

        description:
          'Current Sumcoin index price, market capitalization, volume and supply information.',

        url:
          'https://sumcoinprice.com/app/',

        dateModified:
          market.updated_at,

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

          {
            '@type':
              'PropertyValue',

            name:
              'Circulating supply',

            value:
              Number(
                market.circulating_supply
              ),

            unitText:
              'SUM',
          },

          {
            '@type':
              'PropertyValue',

            name:
              'Maximum supply',

            value:
              Number(
                market.max_supply
              ),

            unitText:
              'SUM',
          },

          {
            '@type':
              'PropertyValue',

            name:
              'Fully diluted market capitalization',

            value:
              Number(
                market.fully_diluted_market_cap
              ),

            unitText:
              'USD',
          },

        ],
      },

    ],

  }

  const jsonLdTag =
    `<script id="sumcoin-live-jsonld" type="application/ld+json">${JSON.stringify(
      jsonLd
    )}</script>`

  output =
    output.replace(
      '</head>',
      `  ${jsonLdTag}\n</head>`
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
  'Prerendered React markup into dist/index.html'
)
