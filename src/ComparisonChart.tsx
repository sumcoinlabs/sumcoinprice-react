import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  ColorType,
  CrosshairMode,
  LineSeries,
  createChart,
  type IChartApi,
  type UTCTimestamp,
} from 'lightweight-charts'


type ComparisonRange =
  | '1y'
  | '3y'
  | '5y'
  | '10y'
  | 'all'


type ComparisonPoint = {
  time: number
  date: string
  sum: number
  btc: number
  gold: number
  silver: number
  dollar: number
}


type ComparisonResponse = {
  success: boolean
  range: ComparisonRange
  frequency: string
  base_date: string
  end_date: string
  baseline: number
  count: number

  returns_percent: {
    sum: number
    btc: number
    gold: number
    silver: number
    dollar: number
  }

  data: ComparisonPoint[]
}


type HoverValues = {
  date: string
  sum: number
  btc: number
  gold: number
  silver: number
  dollar: number
}


const ranges: {
  key: ComparisonRange
  label: string
}[] = [
  {
    key: '1y',
    label: '1 Year',
  },
  {
    key: '3y',
    label: '3 Years',
  },
  {
    key: '5y',
    label: '5 Years',
  },
  {
    key: '10y',
    label: '10 Years',
  },
  {
    key: 'all',
    label: 'All Time',
  },
]


const assets = [
  {
    key: 'sum',
    name: 'SUM',
    color: '#4285f4',
  },
  {
    key: 'btc',
    name: 'Bitcoin',
    color: '#f7931a',
  },
  {
    key: 'gold',
    name: 'Gold',
    color: '#f5cf62',
  },
  {
    key: 'silver',
    name: 'Silver',
    color: '#bdc7d4',
  },
  {
    key: 'dollar',
    name: 'Dollar Purchasing Power',
    color: '#78e6a3',
  },
] as const


function formatReturn(value: number) {
  if (!Number.isFinite(value)) {
    return '—'
  }

  return (
    `${value >= 0 ? '+' : ''}` +
    `${value.toFixed(2)}%`
  )
}


function prettyDate(date: string) {
  return new Date(
    date + 'T12:00:00'
  ).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      year: 'numeric',
    }
  )
}


export default function ComparisonChart() {

  const chartContainer =
    useRef<HTMLDivElement>(null)

  const chartRef =
    useRef<IChartApi | null>(null)

  const [range, setRange] =
    useState<ComparisonRange>('5y')

  const [result, setResult] =
    useState<ComparisonResponse | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [hover, setHover] =
    useState<HoverValues | null>(null)


  /*
   * -------------------------------------------------------
   * Load comparison API
   * -------------------------------------------------------
   */

  useEffect(() => {

    let active = true

    async function load() {

      setLoading(true)
      setError('')

      try {

        const response =
          await fetch(
            `/comparison.php?range=${range}`,
            {
              cache: 'no-store',
            }
          )

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          )
        }

        const json:
          ComparisonResponse =
          await response.json()

        if (!json.success) {
          throw new Error(
            'Comparison API returned an error'
          )
        }

        if (active) {
          setResult(json)
          setHover(null)
        }

      } catch (err) {

        console.error(err)

        if (active) {
          setError(
            'Comparison data is temporarily unavailable.'
          )
        }

      } finally {

        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }

  }, [range])


  /*
   * -------------------------------------------------------
   * Build chart
   * -------------------------------------------------------
   */

  useEffect(() => {

    if (
      !chartContainer.current ||
      !result ||
      result.data.length === 0
    ) {
      return
    }


    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }


    const mobile =
      window.innerWidth <= 600


    const chart =
      createChart(
        chartContainer.current,
        {
          width:
            chartContainer.current
              .clientWidth,

          height:
            mobile
              ? 390
              : 500,

          layout: {
            background: {
              type: ColorType.Solid,
              color: 'transparent',
            },

            textColor:
              '#8a94a5',

            fontFamily:
              'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

            fontSize: 12,
          },

          grid: {
            vertLines: {
              color:
                'rgba(255,255,255,.028)',
            },

            horzLines: {
              color:
                'rgba(255,255,255,.045)',
            },
          },

          crosshair: {
            mode:
              CrosshairMode.Normal,

            vertLine: {
              color:
                'rgba(255,255,255,.22)',

              labelBackgroundColor:
                '#242a36',
            },

            horzLine: {
              color:
                'rgba(255,255,255,.16)',

              labelBackgroundColor:
                '#242a36',
            },
          },

          rightPriceScale: {
            borderVisible: false,

            scaleMargins: {
              top: 0.10,
              bottom: 0.10,
            },
          },

          timeScale: {
            borderVisible: false,

            timeVisible: false,

            rightOffset: 2,

            minBarSpacing: 0.4,
          },

          handleScroll: {
            mouseWheel: true,
            pressedMouseMove: true,
            horzTouchDrag: true,
            vertTouchDrag: false,
          },

          handleScale: {
            axisPressedMouseMove: true,
            mouseWheel: true,
            pinch: true,
          },
        }
      )


    chartRef.current = chart


    /*
     * Every asset starts at 100.
     *
     * Therefore the lines show relative
     * percentage performance instead of
     * unrelated nominal prices.
     */

    assets.forEach(
      (asset) => {

        const series =
          chart.addSeries(
            LineSeries,
            {
              title:
                asset.name,

              color:
                asset.color,

              lineWidth:
                asset.key === 'sum'
                  ? 3
                  : 2,

              priceLineVisible:
                false,

              lastValueVisible:
                false,

              crosshairMarkerVisible:
                true,

              priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
              },
            }
          )


        series.setData(
          result.data.map(
            (point) => ({
              time: point.time as UTCTimestamp,

              value:
                point[
                  asset.key
                ],
            })
          )
        )
      }
    )


    /*
     * Baseline = 100
     */

    const baseline =
      chart.addSeries(
        LineSeries,
        {
          color:
            'rgba(255,255,255,.16)',

          lineWidth: 1,

          lineStyle: 2,

          priceLineVisible:
            false,

          lastValueVisible:
            false,

          crosshairMarkerVisible:
            false,
        }
      )


    baseline.setData(
      result.data.map(
        (point) => ({
          time: point.time as UTCTimestamp,

          value: 100,
        })
      )
    )


    /*
     * Stable hover.
     *
     * We do NOT insert/remove chart DOM
     * elements during mouse movement.
     * Only text inside a fixed-size area
     * changes.
     */

    chart.subscribeCrosshairMove(
      (param) => {

        if (!param.time) {
          setHover(null)
          return
        }

        const timestamp =
          Number(param.time)

        let closest =
          result.data[0]

        for (
          const point
          of result.data
        ) {

          if (
            Math.abs(
              point.time -
              timestamp
            ) <
            Math.abs(
              closest.time -
              timestamp
            )
          ) {
            closest = point
          }
        }


        setHover({
          date:
            closest.date,

          sum:
            closest.sum,

          btc:
            closest.btc,

          gold:
            closest.gold,

          silver:
            closest.silver,

          dollar:
            closest.dollar,
        })
      }
    )


    requestAnimationFrame(
      () => {
        chart
          .timeScale()
          .fitContent()
      }
    )


    const observer =
      new ResizeObserver(
        () => {

          if (
            !chartContainer.current
          ) {
            return
          }

          chart.resize(
            chartContainer.current
              .clientWidth,

            window.innerWidth <= 600
              ? 390
              : 500
          )
        }
      )


    observer.observe(
      chartContainer.current
    )


    return () => {

      observer.disconnect()

      chart.remove()

      chartRef.current = null
    }

  }, [result])


  const returns =
    result?.returns_percent


  /*
   * Translate the purchasing-power series into the
   * equivalent cumulative increase in consumer prices.
   *
   * Example:
   *
   * Dollar purchasing power: 100 -> 76.17
   *
   * Equivalent price level:
   *
   * 100 / 76.17 = 1.3128
   *
   * Therefore prices rose approximately 31.28%.
   */

  const dollarPurchasingPowerChange =
    returns?.dollar ?? null


  const cumulativePriceIncrease =
    dollarPurchasingPowerChange !== null &&
    dollarPurchasingPowerChange > -100

      ? (
          (
            100 /
            (
              100 +
              dollarPurchasingPowerChange
            )
          ) -
          1
        ) * 100

      : null


  const exampleBasketToday =
    cumulativePriceIncrease !== null

      ? 100 *
        (
          1 +
          cumulativePriceIncrease /
          100
        )

      : null


  return (

    <section
      className="section real-comparison-section"
      id="comparison"
    >

      <div className="comparison-title-area">

        <span className="eyebrow">
          PUT THE INDEX IN CONTEXT
        </span>

        <h2>
          Compare Sumcoin over time.
        </h2>

        <p>
          What matters is not simply what an asset costs today, but how its value changed over the same period. This chart gives SUM, Bitcoin, gold, silver and the U.S. dollar the exact same starting value of 100 so their relative performance can be compared directly.
        </p>

      </div>


      <div className="comparison-range-buttons">

        {ranges.map(
          (item) => (

            <button
              key={
                item.key
              }
              className={
                range ===
                item.key
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setRange(
                  item.key
                )
              }
            >
              {item.label}
            </button>

          )
        )}

      </div>


      <div className="comparison-panel">


        <div className="comparison-return-grid">


          <div className="comparison-return-card sum-card">

            <div className="asset-name">

              <span className="asset-color sum-color" />

              SUM

            </div>

            <strong
              className={
                (returns?.sum ?? 0) >= 0
                  ? 'up'
                  : 'down'
              }
            >
              {returns
                ? formatReturn(
                    returns.sum
                  )
                : '—'}
            </strong>

          </div>


          <div className="comparison-return-card">

            <div className="asset-name">

              <span className="asset-color btc-color" />

              Bitcoin

            </div>

            <strong
              className={
                (returns?.btc ?? 0) >= 0
                  ? 'up'
                  : 'down'
              }
            >
              {returns
                ? formatReturn(
                    returns.btc
                  )
                : '—'}
            </strong>

          </div>


          <div className="comparison-return-card">

            <div className="asset-name">

              <span className="asset-color gold-color" />

              Gold

            </div>

            <strong
              className={
                (returns?.gold ?? 0) >= 0
                  ? 'up'
                  : 'down'
              }
            >
              {returns
                ? formatReturn(
                    returns.gold
                  )
                : '—'}
            </strong>

          </div>


          <div className="comparison-return-card">

            <div className="asset-name">

              <span className="asset-color silver-color" />

              Silver

            </div>

            <strong
              className={
                (returns?.silver ?? 0) >= 0
                  ? 'up'
                  : 'down'
              }
            >
              {returns
                ? formatReturn(
                    returns.silver
                  )
                : '—'}
            </strong>

          </div>


          <div className="comparison-return-card">

            <div className="asset-name">

              <span className="asset-color dollar-color" />

              Dollar Purchasing Power

            </div>

            <strong
              className={
                (returns?.dollar ?? 0) >= 0
                  ? 'up'
                  : 'down'
              }
            >
              {returns
                ? formatReturn(
                    returns.dollar
                  )
                : '—'}
            </strong>

          </div>

        </div>


        <div className="comparison-hover-bar">

          <div className="hover-month">

            {hover
              ? prettyDate(
                  hover.date
                )
              : result
                ? `${prettyDate(
                    result.base_date
                  )} — ${prettyDate(
                    result.end_date
                  )}`
                : 'Loading comparison…'}

          </div>


          <div className="hover-values">

            <span>
              SUM
              <strong>
                {hover
                  ? hover.sum.toFixed(2)
                  : '—'}
              </strong>
            </span>

            <span>
              BTC
              <strong>
                {hover
                  ? hover.btc.toFixed(2)
                  : '—'}
              </strong>
            </span>

            <span>
              GOLD
              <strong>
                {hover
                  ? hover.gold.toFixed(2)
                  : '—'}
              </strong>
            </span>

            <span>
              SILVER
              <strong>
                {hover
                  ? hover.silver.toFixed(2)
                  : '—'}
              </strong>
            </span>

            <span>
              DOLLAR PP
              <strong>
                {hover
                  ? hover.dollar.toFixed(2)
                  : '—'}
              </strong>
            </span>

          </div>

        </div>


        <div className="comparison-chart-shell">

          {loading && (
            <div className="comparison-loading">
              Loading relative performance…
            </div>
          )}

          {error && (
            <div className="comparison-loading comparison-error">
              {error}
            </div>
          )}

          <div
            ref={
              chartContainer
            }
            className={
              loading || error
                ? 'comparison-chart comparison-chart-hidden'
                : 'comparison-chart'
            }
          />

        </div>


        <div className="comparison-explanation">

          <div>

            <strong>
              How to read this chart
            </strong>

            <p>
              Every line begins at 100. A value of 150 means that asset gained 50% from the beginning of the selected period. A value of 80 means it lost 20%. This lets assets with completely different nominal prices be compared fairly.
            </p>

          </div>


          <div>

            <strong>
              What “U.S. Dollar” means
            </strong>

            <p>
              The dollar line represents purchasing power using U.S. consumer-price data. As consumer prices rise, a dollar buys less, so its purchasing-power line declines. It is not the foreign-exchange Dollar Index.
            </p>

          </div>

        </div>


        {result &&
        cumulativePriceIncrease !== null &&
        dollarPurchasingPowerChange !== null &&
        exampleBasketToday !== null && (

          <div className="dollar-impact-card">

            <div className="dollar-impact-heading">

              <span className="eyebrow">
                WHAT HAPPENED TO THE DOLLAR?
              </span>

              <h3>
                Prices rose{' '}
                <strong>
                  +{cumulativePriceIncrease.toFixed(2)}%
                </strong>
                {' '}over this period.
              </h3>

              <p>
                The purchasing-power line in the chart tells the same
                story from the opposite direction. Consumer prices rose
                while each dollar purchased less.
              </p>

            </div>


            <div className="dollar-impact-numbers">

              <div className="dollar-impact-stat">

                <span>
                  Consumer prices
                </span>

                <strong className="price-rise">
                  +{cumulativePriceIncrease.toFixed(2)}%
                </strong>

                <small>
                  cumulative change
                </small>

              </div>


              <div className="dollar-impact-stat">

                <span>
                  Dollar purchasing power
                </span>

                <strong className="purchasing-loss">
                  {dollarPurchasingPowerChange.toFixed(2)}%
                </strong>

                <small>
                  over the same period
                </small>

              </div>


              <div className="dollar-impact-stat">

                <span>
                  $100 equivalent today
                </span>

                <strong>
                  ${exampleBasketToday.toFixed(2)}
                </strong>

                <small>
                  approximate CPI equivalent
                </small>

              </div>

            </div>


            <div className="dollar-human-explainer">

              <div className="dollar-example-icon">
                $
              </div>

              <div>

                <strong>
                  What does that mean in everyday terms?
                </strong>

                <p>
                  A general basket of consumer goods that cost about
                  $100 at the beginning of this period would cost
                  approximately ${exampleBasketToday.toFixed(2)} at
                  the ending CPI level.
                </p>

                <p className="income-point">
                  Put another way, a person's income would have needed
                  to rise about{' '}
                  <strong>
                    {cumulativePriceIncrease.toFixed(2)}%
                  </strong>
                  {' '}just to maintain approximately the same consumer
                  purchasing power.
                </p>

              </div>

            </div>


            <div className="dollar-method-note">

              Based on the U.S. Consumer Price Index (CPI). The
              comparison measures general consumer purchasing power,
              not the foreign-exchange value of the U.S. dollar.

            </div>

          </div>

        )}


        {result && (

          <div className="comparison-source-note">

            <span>
              SUM:
              Sumcoin Index history
            </span>

            <span>
              Bitcoin:
              Coinbase
            </span>

            <span>
              Gold & Silver:
              World Bank Commodity Markets
            </span>

            <span>
              U.S. Dollar:
              U.S. CPI / FRED
            </span>

            <span>
              Monthly comparison
            </span>

          </div>

        )}

      </div>

    </section>
  )
}
