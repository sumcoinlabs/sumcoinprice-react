import {
  useEffect,
  useState,
} from 'react'


type MarketData = {
  success: boolean
  name: string
  symbol: string
  currency: string
  price: number
  market_cap: number | null
  volume_24h: number | null
  circulating_supply: number | null
  max_supply: number | null
  fully_diluted_market_cap: number | null
  updated_at: string
}


function priceMoney(
  value:
    | number
    | null
) {

  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return '—'
  }

  return value.toLocaleString(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )
}


function money(
  value:
    | number
    | null
) {

  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return '—'
  }

  if (value >= 1_000_000_000) {

    return (
      '$' +
      (
        value /
        1_000_000_000
      ).toFixed(2) +
      'B'
    )
  }

  if (value >= 1_000_000) {

    return (
      '$' +
      (
        value /
        1_000_000
      ).toFixed(2) +
      'M'
    )
  }

  if (value >= 1_000) {

    return (
      '$' +
      (
        value /
        1_000
      ).toFixed(2) +
      'K'
    )
  }

  return (
    '$' +
    value.toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )
  )
}


function supply(
  value:
    | number
    | null
) {

  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return '—'
  }

  if (
    value >=
    1_000_000
  ) {

    return (
      (
        value /
        1_000_000
      ).toFixed(2) +
      'M SUM'
    )
  }

  return (
    value.toLocaleString(
      'en-US'
    ) +
    ' SUM'
  )
}


export default function MarketSnapshot() {

  const [
    market,
    setMarket
  ] =
    useState<
      MarketData | null
    >(null)


  useEffect(() => {

    let active = true


    async function load() {

      try {

        const response =
          await fetch(
            '/market.php',
            {
              cache:
                'no-store',
            }
          )


        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          )
        }


        const json:
          MarketData =
          await response.json()


        if (
          active &&
          json.success
        ) {

          setMarket(json)

        }

      } catch (error) {

        console.error(
          'Market snapshot failed:',
          error
        )

      }
    }


    load()


    const timer =
      window.setInterval(
        load,
        60000
      )


    return () => {

      active = false

      window.clearInterval(
        timer
      )

    }

  }, [])


  /*
   * Keep dynamic machine-readable
   * structured data synchronized with
   * the visible market information.
   */

  useEffect(() => {

    if (!market) {
      return
    }


    const existing =
      document.getElementById(
        'sumcoin-live-jsonld'
      )


    if (existing) {
      existing.remove()
    }


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
              market.price,

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


    const script =
      document.createElement(
        'script'
      )


    script.id =
      'sumcoin-live-jsonld'

    script.type =
      'application/ld+json'

    script.text =
      JSON.stringify(
        jsonLd
      )


    document.head.appendChild(
      script
    )


    return () => {

      script.remove()

    }

  }, [market])


  return (

    <section
      className="market-snapshot"
      aria-label="Current Sumcoin market data"
    >

      <div className="market-snapshot-heading">

        <span className="eyebrow">
          LIVE SUMCOIN INDEX
        </span>

        <h2>
          Current Sumcoin market data
        </h2>

        <p>
          Current SUM reference value and
          network market statistics from
          the Sumcoin Index.
        </p>

      </div>


      <div className="market-snapshot-grid">


        <div className="market-stat primary">

          <span>
            SUM Price
          </span>

          <strong>
            {market
              ? priceMoney(
                  market.price
                )
              : '—'}
          </strong>

          <small>
            1 SUM / USD
          </small>

        </div>


        <div className="market-stat">

          <span>
            Market Cap
          </span>

          <strong>
            {market
              ? money(
                  market.market_cap
                )
              : '—'}
          </strong>

          <small>
            indexed value
          </small>

        </div>


        <div className="market-stat">

          <span>
            24h Volume
          </span>

          <strong>
            {market
              ? money(
                  market.volume_24h
                )
              : '—'}
          </strong>

          <small>
            network activity
          </small>

        </div>


        <div className="market-stat">

          <span>
            Circulating Supply
          </span>

          <strong>
            {market
              ? supply(
                  market.circulating_supply
                )
              : '—'}
          </strong>

          <small>
            circulating SUM
          </small>

        </div>


        <div className="market-stat">

          <span>
            Maximum Supply
          </span>

          <strong>
            {market
              ? supply(
                  market.max_supply
                )
              : '—'}
          </strong>

          <small>
            protocol maximum
          </small>

        </div>


      </div>


      <div className="market-snapshot-source">

        Live market values supplied by the
        Sumcoin Index.

      </div>

    </section>

  )
}
