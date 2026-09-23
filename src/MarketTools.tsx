import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import './MarketTools.css'

export type MarketData = {
  price: number
  market_cap: number | null
  volume_24h: number | null
  circulating_supply: number | null
  max_supply: number | null
  updated_at?: string
  btc_ratio?: number
  usd_1y_change?: number
  usd_1y_high?: number
  usd_1y_low?: number
  usd_all_high?: number
  usd_all_low?: number
  btc_1y_change?: number
  btc_1y_high?: number
  btc_1y_low?: number
}

type HistoryResponse = {
  success: boolean

  latest?: {
    price: number
    time?: number
    time_iso?: string
  }

  period?: {
    open: number
    close: number
    high: number
    low: number
    change: number
    change_percent: number
  }

  data?: Array<{
    time: number
    close: number
  }>
}

const MarketDataContext =
  createContext<MarketData | null>(null)

export function MarketDataProvider({
  initialMarket,
  children,
}: {
  initialMarket: MarketData | null
  children: ReactNode
}) {
  return (
    <MarketDataContext.Provider
      value={initialMarket}
    >
      {children}
    </MarketDataContext.Provider>
  )
}

export function useInitialMarketData() {
  return useContext(
    MarketDataContext
  )
}

function finiteOrNull(
  value: unknown
) {
  const number =
    Number(value)

  return Number.isFinite(number)
    ? number
    : null
}

export function formatUsd(
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

function formatNumber(
  value: number | null,
  digits = 2
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
      maximumFractionDigits:
        digits,
    }
  )
}

function formatPercent(
  value: number | null
) {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return '—'
  }

  const sign =
    value > 0
      ? '+'
      : ''

  return `${sign}${value.toFixed(2)}%`
}

async function fetchHistory(
  range: string,
  pair: 'usd' | 'btc'
) {
  const response =
    await fetch(
      `/api/history.php?range=${range}&pair=${pair}`,
      {
        cache: 'no-store',
      }
    )

  if (!response.ok) {
    throw new Error(
      `History HTTP ${response.status}`
    )
  }

  const json =
    await response.json() as
      HistoryResponse

  if (!json.success) {
    throw new Error(
      'History response unsuccessful'
    )
  }

  return json
}

export function useMarketData() {
  const initialMarket =
    useInitialMarketData()

  const [market, setMarket] =
    useState<MarketData | null>(
      initialMarket
    )

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
          finiteOrNull(
            json.price
          )

        if (
          price === null ||
          price <= 0
        ) {
          throw new Error(
            'Invalid SUM price'
          )
        }

        if (!cancelled) {
          setMarket(
            (previous) => ({
              ...(previous ?? {}),
              price,
              market_cap:
                finiteOrNull(
                  json.market_cap
                ),
              volume_24h:
                finiteOrNull(
                  json.volume_24h
                ),
              circulating_supply:
                finiteOrNull(
                  json.circulating_supply
                ),
              max_supply:
                finiteOrNull(
                  json.max_supply
                ),
              updated_at:
                json.updated_at,
              btc_ratio:
                previous?.btc_ratio ??
                initialMarket?.btc_ratio,
            })
          )

          setError(false)
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
  }, [initialMarket])

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
      <div className="live-market-primary">
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

        <small>
          1 SUM / USD
        </small>
      </div>

      <div>
        <span>MARKET CAP</span>

        <strong>
          {market?.market_cap !== null &&
          market?.market_cap !== undefined
            ? `$${formatCompact(
                market.market_cap
              )}`
            : '—'}
        </strong>

        <small>
          Current indexed value
        </small>
      </div>

      <div>
        <span>24H VOLUME</span>

        <strong>
          {market?.volume_24h !== null &&
          market?.volume_24h !== undefined
            ? `$${formatCompact(
                market.volume_24h
              )}`
            : '—'}
        </strong>

        <small>
          Latest activity
        </small>
      </div>

      <div>
        <span>MAX SUPPLY</span>

        <strong>
          {market?.max_supply !== null &&
          market?.max_supply !== undefined
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

export function P2PReferenceCard() {
  const {
    market,
    error,
  } = useMarketData()

  return (
    <section className="p2p-rate-card">
      <div className="p2p-rate-label">
        AGREED REFERENCE VALUE
      </div>

      <strong>
        {market
          ? formatUsd(
              market.price
            )
          : error
            ? 'Unavailable'
            : 'Loading…'}
      </strong>

      <p>
        The Sumcoin Index gives two
        people a common SUM/USD
        reference point before they
        transact directly with one
        another.
      </p>

      <a href="/calculator/">
        Convert SUM and USD →
      </a>
    </section>
  )
}

export function SumCalculator() {
  const initialMarket =
    useInitialMarketData()

  const {
    market,
  } = useMarketData()

  const initialPrice =
    initialMarket?.price ??
    null

  const [sum, setSum] =
    useState('1')

  const [usd, setUsd] =
    useState(
      initialPrice
        ? initialPrice.toFixed(2)
        : ''
    )

  const price =
    market?.price ??
    null

  function changeSum(
    value: string
  ) {
    setSum(value)

    const number =
      Number(value)

    if (
      price !== null &&
      Number.isFinite(number)
    ) {
      setUsd(
        (
          number *
          price
        ).toFixed(2)
      )
    } else {
      setUsd('')
    }
  }

  function changeUsd(
    value: string
  ) {
    setUsd(value)

    const number =
      Number(value)

    if (
      price !== null &&
      price > 0 &&
      Number.isFinite(number)
    ) {
      setSum(
        (
          number /
          price
        ).toFixed(8)
      )
    } else {
      setSum('')
    }
  }

  useEffect(() => {
    if (
      price !== null &&
      Number.isFinite(
        Number(sum)
      )
    ) {
      setUsd(
        (
          Number(sum) *
          price
        ).toFixed(2)
      )
    }
  }, [price])

  return (
    <section className="calculator-panel">
      <div className="calculator-topline">
        <div>
          <span>
            CURRENT SUMCOIN INDEX RATE
          </span>

          <strong>
            {formatUsd(price)}
          </strong>

          <small>
            per 1 SUM
          </small>
        </div>

        <div className="calculator-live">
          LIVE INDEX
        </div>
      </div>

      <div className="calculator-fields">
        <label>
          <span>SUMCOIN</span>

          <input
            aria-label="Sumcoin amount"
            type="number"
            min="0"
            step="any"
            value={sum}
            onChange={(event) =>
              changeSum(
                event.target.value
              )
            }
          />
        </label>

        <div className="calculator-equals">
          ⇄
        </div>

        <label>
          <span>U.S. DOLLARS</span>

          <input
            aria-label="U.S. dollar amount"
            type="number"
            min="0"
            step="any"
            value={usd}
            onChange={(event) =>
              changeUsd(
                event.target.value
              )
            }
          />
        </label>
      </div>

      <p className="calculator-note">
        Both fields are editable. The
        conversion uses the current
        Sumcoin Index reference rate,
        not a guaranteed execution
        price from an exchange or
        counterparty.
      </p>
    </section>
  )
}

export function RateExamples() {
  const {
    market,
  } = useMarketData()

  const price =
    market?.price ??
    null

  const examples = [
    {
      label: '0.10 SUM',
      value:
        price
          ? formatUsd(
              price * 0.1
            )
          : '—',
    },
    {
      label: '1 SUM',
      value:
        formatUsd(price),
    },
    {
      label: '10 SUM',
      value:
        price
          ? formatUsd(
              price * 10
            )
          : '—',
    },
    {
      label: '$1,000',
      value:
        price
          ? `${formatNumber(
              1000 / price,
              6
            )} SUM`
          : '—',
    },
  ]

  return (
    <div className="rate-examples">
      {examples.map(
        (example) => (
          <div
            key={
              example.label
            }
          >
            <span>
              {example.label}
            </span>

            <strong>
              {example.value}
            </strong>
          </div>
        )
      )}
    </div>
  )
}

export function SumBtcSnapshot() {
  const initialMarket =
    useInitialMarketData()

  const [ratio, setRatio] =
    useState<number | null>(
      initialMarket?.btc_ratio ??
      null
    )

  const [error, setError] =
    useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const json =
          await fetchHistory(
            '1d',
            'btc'
          )

        const value =
          finiteOrNull(
            json.latest?.price
          )

        if (
          value === null ||
          value <= 0
        ) {
          throw new Error(
            'Invalid SUM/BTC response'
          )
        }

        if (!cancelled) {
          setRatio(value)
          setError(false)
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
      <div>
        <span>
          LIVE SUM / BTC
        </span>

        <strong>
          {ratio !== null
            ? `${ratio.toFixed(
                8
              )} BTC`
            : error
              ? 'Unavailable'
              : 'Loading…'}
        </strong>

        <small>
          Current value of one SUM
          expressed in Bitcoin.
        </small>
      </div>

      <div className="btc-symbol">
        SUM
        <i>↔</i>
        BTC
      </div>
    </section>
  )
}

export function HistorySnapshot() {
  const initial =
    useInitialMarketData()

  const [oneYearChange, setOneYearChange] =
    useState<number | null>(
      finiteOrNull(
        initial?.usd_1y_change
      )
    )

  const [oneYearHigh, setOneYearHigh] =
    useState<number | null>(
      finiteOrNull(
        initial?.usd_1y_high
      )
    )

  const [oneYearLow, setOneYearLow] =
    useState<number | null>(
      finiteOrNull(
        initial?.usd_1y_low
      )
    )

  const [allHigh, setAllHigh] =
    useState<number | null>(
      finiteOrNull(
        initial?.usd_all_high
      )
    )

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetchHistory(
        '1y',
        'usd'
      ),
      fetchHistory(
        'all',
        'usd'
      ),
    ])
      .then(
        ([
          oneYear,
          all,
        ]) => {
          if (cancelled) {
            return
          }

          setOneYearChange(
            finiteOrNull(
              oneYear.period
                ?.change_percent
            )
          )

          setOneYearHigh(
            finiteOrNull(
              oneYear.period
                ?.high
            )
          )

          setOneYearLow(
            finiteOrNull(
              oneYear.period
                ?.low
            )
          )

          setAllHigh(
            finiteOrNull(
              all.period?.high
            )
          )
        }
      )
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="history-snapshot">
      <div className="history-stat-emphasis">
        <span>
          1 YEAR CHANGE
        </span>

        <strong>
          {formatPercent(
            oneYearChange
          )}
        </strong>

        <small>
          SUM/USD reference rate
        </small>
      </div>

      <div>
        <span>1Y HIGH</span>

        <strong>
          {formatUsd(
            oneYearHigh
          )}
        </strong>
      </div>

      <div>
        <span>1Y LOW</span>

        <strong>
          {formatUsd(
            oneYearLow
          )}
        </strong>
      </div>

      <div>
        <span>
          HISTORICAL HIGH
        </span>

        <strong>
          {formatUsd(
            allHigh
          )}
        </strong>
      </div>
    </section>
  )
}

export function CompareStats() {
  const initial =
    useInitialMarketData()

  const [change, setChange] =
    useState<number | null>(
      finiteOrNull(
        initial?.btc_1y_change
      )
    )

  const [high, setHigh] =
    useState<number | null>(
      finiteOrNull(
        initial?.btc_1y_high
      )
    )

  const [low, setLow] =
    useState<number | null>(
      finiteOrNull(
        initial?.btc_1y_low
      )
    )

  useEffect(() => {
    let cancelled = false

    fetchHistory(
      '1y',
      'btc'
    )
      .then((json) => {
        if (cancelled) {
          return
        }

        setChange(
          finiteOrNull(
            json.period
              ?.change_percent
          )
        )

        setHigh(
          finiteOrNull(
            json.period?.high
          )
        )

        setLow(
          finiteOrNull(
            json.period?.low
          )
        )
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="compare-stats">
      <div>
        <span>
          1Y SUM/BTC
        </span>

        <strong>
          {formatPercent(
            change
          )}
        </strong>
      </div>

      <div>
        <span>
          1Y RATIO HIGH
        </span>

        <strong>
          {high !== null
            ? `${high.toFixed(
                8
              )} BTC`
            : '—'}
        </strong>
      </div>

      <div>
        <span>
          1Y RATIO LOW
        </span>

        <strong>
          {low !== null
            ? `${low.toFixed(
                8
              )} BTC`
            : '—'}
        </strong>
      </div>
    </div>
  )
}
