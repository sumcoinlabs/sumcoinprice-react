import {
  useEffect,
  useState,
} from 'react'

import './MarketTools.css'

type MarketData = {
  price: number
  market_cap: number
  volume_24h: number
  circulating_supply: number
  max_supply: number
  updated_at?: string
}

type HistoryResponse = {
  success: boolean
  latest?: {
    price: number
    time_iso?: string
  }
}

function formatUsd(value: number | null) {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return '—'
  }

  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value)
}

function formatCompact(
  value: number | null
) {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return '—'
  }

  return new Intl.NumberFormat(
    'en-US',
    {
      notation: 'compact',
      maximumFractionDigits: 2,
    }
  ).format(value)
}

export function useMarketData() {
  const [market, setMarket] =
    useState<MarketData | null>(null)

  const [error, setError] =
    useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response =
          await fetch(
            '/market.php',
            {
              cache: 'no-store',
            }
          )

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          )
        }

        const json =
          await response.json()

        const price =
          Number(json.price)

        if (
          !Number.isFinite(price)
        ) {
          throw new Error(
            'Invalid SUM price'
          )
        }

        if (!cancelled) {
          setMarket({
            price,
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
            updated_at:
              json.updated_at,
          })
        }
      } catch {
        if (!cancelled) {
          setError(true)
        }
      }
    }

    load()

    const timer =
      window.setInterval(
        load,
        60_000
      )

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  return {
    market,
    error,
  }
}

export function LiveMarketStrip() {
  const {
    market,
    error,
  } = useMarketData()

  return (
    <section
      className="live-market-strip"
      aria-label="Live Sumcoin market data"
    >
      <div>
        <span>SUM INDEX PRICE</span>
        <strong>
          {market
            ? formatUsd(
                market.price
              )
            : error
              ? 'Unavailable'
              : 'Loading…'}
        </strong>
        <small>SUM / USD</small>
      </div>

      <div>
        <span>MARKET CAP</span>
        <strong>
          {market
            ? `$${formatCompact(
                market.market_cap
              )}`
            : '—'}
        </strong>
        <small>Current market value</small>
      </div>

      <div>
        <span>24H VOLUME</span>
        <strong>
          {market
            ? `$${formatCompact(
                market.volume_24h
              )}`
            : '—'}
        </strong>
        <small>Latest activity</small>
      </div>

      <div>
        <span>MAX SUPPLY</span>
        <strong>
          {market
            ? formatCompact(
                market.max_supply
              )
            : '—'}
        </strong>
        <small>SUM</small>
      </div>
    </section>
  )
}

export function SumCalculator() {
  const {
    market,
  } = useMarketData()

  const [sum, setSum] =
    useState('1')

  const price =
    market?.price ?? null

  const amount =
    Number(sum)

  const usd =
    price !== null &&
    Number.isFinite(amount)
      ? amount * price
      : null

  return (
    <section className="calculator-panel">
      <div className="calculator-rate">
        <span>CURRENT INDEX RATE</span>

        <strong>
          {formatUsd(price)}
        </strong>

        <small>per 1 SUM</small>
      </div>

      <div className="calculator-fields">
        <label>
          <span>SUM</span>

          <input
            type="number"
            min="0"
            step="any"
            value={sum}
            onChange={(event) =>
              setSum(
                event.target.value
              )
            }
          />
        </label>

        <div className="calculator-equals">
          =
        </div>

        <label>
          <span>USD</span>

          <div className="calculator-output">
            {formatUsd(usd)}
          </div>
        </label>
      </div>

      <p className="calculator-note">
        Conversion uses the current
        Sumcoin Index reference rate.
      </p>
    </section>
  )
}

export function SumBtcSnapshot() {
  const [ratio, setRatio] =
    useState<number | null>(null)

  const [error, setError] =
    useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response =
          await fetch(
            '/api/history.php?range=1d&pair=btc',
            {
              cache: 'no-store',
            }
          )

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          )
        }

        const json =
          await response.json() as
            HistoryResponse

        const value =
          Number(
            json.latest?.price
          )

        if (
          !json.success ||
          !Number.isFinite(value)
        ) {
          throw new Error(
            'Invalid SUM/BTC response'
          )
        }

        if (!cancelled) {
          setRatio(value)
        }
      } catch {
        if (!cancelled) {
          setError(true)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="btc-snapshot">
      <span>LIVE SUM / BTC</span>

      <strong>
        {ratio !== null
          ? `${ratio.toFixed(8)} BTC`
          : error
            ? 'Unavailable'
            : 'Loading…'}
      </strong>

      <small>
        Current SUM value expressed
        in Bitcoin
      </small>
    </section>
  )
}
