import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'

import './App.css'
import MarketSnapshot from './MarketSnapshot'
import ComparisonChart from './ComparisonChart'


type Range =
  | '1d'
  | '1w'
  | '1m'
  | '3m'
  | '6m'
  | '1y'
  | '5y'
  | 'all'

type Pair = 'usd' | 'btc'

type ChartMode = 'line' | 'candles'

type Point = {
  time: number
  price: number
  open: number
  high: number
  low: number
  close: number
  samples: number
  gap_before: boolean
}

type APIResponse = {
  success: boolean
  symbol: string
  pair: Pair
  range: Range
  resolution: string
  interval_seconds: number
  count: number

  latest: {
    price: number
    time: number
    time_iso: string
    age_seconds: number
    stale: boolean
  }

  period: {
    start_time: number
    end_time: number
    open: number
    close: number
    high: number
    low: number
    change: number
    change_percent: number
  }

  data: Point[]
}

type TrendPoint = {
  time: number
  price: number
}

type TrendLine = {
  id: number
  a: TrendPoint
  b: TrendPoint
}

type IndicatorPoint = {
  time: UTCTimestamp
  value: number
}


const ranges: { key: Range; label: string }[] = [
  { key: '1d', label: '1D' },
  { key: '1w', label: '1W' },
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: '1y', label: '1Y' },
  { key: '5y', label: '5Y' },
  { key: 'all', label: 'ALL' },
]


const performanceRanges: Range[] = [
  '1d',
  '1w',
  '1m',
  '1y',
  '5y',
  'all',
]


function formatPrice(value: number, pair: Pair) {
  if (!Number.isFinite(value)) return '—'

  if (pair === 'btc') {
    return `${value.toFixed(8)} BTC`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}


function formatCompactPrice(value: number, pair: Pair) {
  if (!Number.isFinite(value)) return '—'

  if (pair === 'btc') {
    return `${value.toFixed(8)} BTC`
  }

  return `$${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)}`
}


function formatChange(value: number, pair: Pair) {
  const sign = value >= 0 ? '+' : ''

  if (pair === 'btc') {
    return `${sign}${value.toFixed(8)} BTC`
  }

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))

  return `${value >= 0 ? '+' : '-'}${formatted}`
}


function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '—'

  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}


function formatDate(timestamp: number, range?: Range) {
  const date = new Date(timestamp * 1000)

  if (range === '1d') {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour:
      range === '1w' || range === '1m'
        ? 'numeric'
        : undefined,
    minute:
      range === '1w' || range === '1m'
        ? '2-digit'
        : undefined,
  })
}


function formatShortDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  )
}


function emaFromValues(
  values: { time: number; value: number }[],
  period: number
): IndicatorPoint[] {
  if (!values.length) return []

  const multiplier = 2 / (period + 1)
  const output: IndicatorPoint[] = []

  let current = values[0].value

  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      current = values[i].value
    } else {
      current =
        values[i].value * multiplier +
        current * (1 - multiplier)
    }

    if (i >= period - 1) {
      output.push({
        time: values[i].time as UTCTimestamp,
        value: current,
      })
    }
  }

  return output
}




function rsi(points: Point[], period = 14): IndicatorPoint[] {
  if (points.length <= period) return []

  const output: IndicatorPoint[] = []

  let gainSum = 0
  let lossSum = 0

  for (let i = 1; i <= period; i++) {
    const delta =
      points[i].close -
      points[i - 1].close

    if (delta >= 0) gainSum += delta
    else lossSum += Math.abs(delta)
  }

  let avgGain = gainSum / period
  let avgLoss = lossSum / period

  const firstRS =
    avgLoss === 0
      ? 100
      : avgGain / avgLoss

  output.push({
    time: points[period].time as UTCTimestamp,
    value:
      avgLoss === 0
        ? 100
        : 100 - 100 / (1 + firstRS),
  })

  for (
    let i = period + 1;
    i < points.length;
    i++
  ) {
    const delta =
      points[i].close -
      points[i - 1].close

    const gain =
      delta > 0 ? delta : 0

    const loss =
      delta < 0 ? Math.abs(delta) : 0

    avgGain =
      (avgGain * (period - 1) + gain) /
      period

    avgLoss =
      (avgLoss * (period - 1) + loss) /
      period

    const value =
      avgLoss === 0
        ? 100
        : 100 -
          100 /
            (1 + avgGain / avgLoss)

    output.push({
      time: points[i].time as UTCTimestamp,
      value,
    })
  }

  return output
}


function calculateMACD(points: Point[]) {
  const values = points.map((p) => ({
    time: p.time,
    value: p.close,
  }))

  const fast = emaFromValues(values, 12)
  const slow = emaFromValues(values, 26)

  const fastMap = new Map<number, number>()

  fast.forEach((p) => {
    fastMap.set(Number(p.time), p.value)
  })

  const macdValues: {
    time: number
    value: number
  }[] = []

  slow.forEach((p) => {
    const time = Number(p.time)
    const fastValue = fastMap.get(time)

    if (fastValue !== undefined) {
      macdValues.push({
        time,
        value: fastValue - p.value,
      })
    }
  })

  const signal =
    emaFromValues(macdValues, 9)

  const signalMap = new Map<number, number>()

  signal.forEach((p) => {
    signalMap.set(Number(p.time), p.value)
  })

  const histogram = macdValues
    .filter((p) =>
      signalMap.has(p.time)
    )
    .map((p) => ({
      time: p.time as UTCTimestamp,
      value:
        p.value -
        (signalMap.get(p.time) ?? 0),
    }))

  return {
    macd: macdValues.map((p) => ({
      time: p.time as UTCTimestamp,
      value: p.value,
    })),
    signal,
    histogram,
  }
}


function App() {
  const chartContainer =
    useRef<HTMLDivElement>(null)

  const chartRef =
    useRef<IChartApi | null>(null)

  const seriesRef =
    useRef<ISeriesApi<any> | null>(null)

  const drawTrendRef =
    useRef(false)

  const pendingTrendRef =
    useRef<TrendPoint | null>(null)

  const [range, setRange] =
    useState<Range>('1d')

  const [pair, setPair] =
    useState<Pair>('usd')

  const [mode, setMode] =
    useState<ChartMode>('line')

  const [showRSI, setShowRSI] =
    useState(false)

  const [showMACD, setShowMACD] =
    useState(false)

  const [drawTrend, setDrawTrend] =
    useState(false)

  const [trendLines, setTrendLines] =
    useState<TrendLine[]>([])

  const [pendingTrend, setPendingTrend] =
    useState<TrendPoint | null>(null)

  const [trendVersion, setTrendVersion] =
    useState(0)

  const [result, setResult] =
    useState<APIResponse | null>(null)

  const [allHistory, setAllHistory] =
    useState<Point[]>([])

  const [performance, setPerformance] =
    useState<
      Partial<Record<Range, APIResponse>>
    >({})

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [hoverPoint, setHoverPoint] =
    useState<Point | null>(null)

  const [hoverPrice, setHoverPrice] =
    useState<number | null>(null)

  const [hoverTime, setHoverTime] =
    useState<number | null>(null)

  const [calculatorAmount, setCalculatorAmount] =
    useState('1')

  const [calculatorDate, setCalculatorDate] =
    useState('')


  useEffect(() => {
    drawTrendRef.current = drawTrend
  }, [drawTrend])


  useEffect(() => {
    pendingTrendRef.current =
      pendingTrend
  }, [pendingTrend])


  useEffect(() => {
    let active = true

    async function load(
      showLoading = true
    ) {
      if (showLoading) {
        setLoading(true)
      }

      setError('')

      try {
        const response =
          await fetch(
            `/app/api/history.php?range=${range}&pair=${pair}`,
            {
              cache: 'no-store',
            }
          )

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          )
        }

        const json: APIResponse =
          await response.json()

        if (!json.success) {
          throw new Error(
            'API returned an error'
          )
        }

        if (active) {
          setResult(json)
        }
      } catch (err) {
        console.error(err)

        if (active) {
          setError(
            'Unable to load Sumcoin market data.'
          )
        }
      } finally {
        if (
          active &&
          showLoading
        ) {
          setLoading(false)
        }
      }
    }

    load()

    const timer =
      window.setInterval(
        () => load(false),
        60000
      )

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [range, pair])


  useEffect(() => {
    let active = true

    async function loadPerformance() {
      try {
        const responses =
          await Promise.all(
            performanceRanges.map(
              async (r) => {
                const response =
                  await fetch(
                    `/app/api/history.php?range=${r}&pair=${pair}`,
                    {
                      cache: 'no-store',
                    }
                  )

                const data: APIResponse =
                  await response.json()

                return [r, data] as const
              }
            )
          )

        if (!active) return

        const map:
          Partial<
            Record<
              Range,
              APIResponse
            >
          > = {}

        responses.forEach(
          ([r, data]) => {
            if (data.success) {
              map[r] = data
            }
          }
        )

        setPerformance(map)

        if (map.all) {
          setAllHistory(
            map.all.data
          )

          if (
            !calculatorDate &&
            map.all.data.length
          ) {
            const firstPoint =
              map.all.data[0]

            setCalculatorDate(
              new Date(
                firstPoint.time * 1000
              )
                .toISOString()
                .slice(0, 10)
            )
          }
        }
      } catch (err) {
        console.error(
          'Performance load failed:',
          err
        )
      }
    }

    loadPerformance()

    return () => {
      active = false
    }
  }, [pair])


  useEffect(() => {
    setHoverPoint(null)
    setHoverPrice(null)
    setHoverTime(null)
    setTrendLines([])
    setPendingTrend(null)
  }, [range, pair])

  const ath = useMemo(() => {

    if (
      !result ||
      !allHistory.length
    ) {
      return null
    }

    let highest =
      allHistory[0]

    allHistory.forEach(
      (point) => {

        if (
          point.high >
          highest.high
        ) {
          highest = point
        }

      }
    )


    /*
     * Only display the REAL all-time high
     * when it exists inside the currently
     * selected chart period.
     */

    if (
      highest.time <
        result.period.start_time ||
      highest.time >
        result.period.end_time
    ) {
      return null
    }


    return {
      price:
        highest.high,

      time:
        highest.time,
    }

  }, [
    allHistory,
    result,
  ])



  const allTimeHigh =
    useMemo(() => {
      if (!allHistory.length) {
        return null
      }

      let highest =
        allHistory[0]

      allHistory.forEach((p) => {
        if (p.high > highest.high) {
          highest = p
        }
      })

      return {
        price: highest.high,
        time: highest.time,
      }
    }, [allHistory])


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
      seriesRef.current = null
    }

    const positive =
      result.period.change >= 0

    const accent =
      positive
        ? '#14d981'
        : '#ff5364'

    const accentSoft =
      positive
        ? 'rgba(20,217,129,.24)'
        : 'rgba(255,83,100,.24)'

    const accentTransparent =
      positive
        ? 'rgba(20,217,129,.01)'
        : 'rgba(255,83,100,.01)'

    const extraHeight =
      (showRSI ? 145 : 0) +
      (showMACD ? 180 : 0)

    const baseHeight =
      window.innerWidth <= 520
        ? 350
        : window.innerWidth <= 800
          ? 400
          : 500

    const chart =
      createChart(
        chartContainer.current,
        {
          width:
            chartContainer.current
              .clientWidth,

          height:
            baseHeight +
            extraHeight,

          layout: {
            background: {
              type:
                ColorType.Solid,
              color:
                'transparent',
            },

            textColor:
              '#818b9c',

            fontFamily:
              'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

            fontSize: 12,

            panes: {
              separatorColor:
                'rgba(233,185,73,.12)',

              separatorHoverColor:
                'rgba(233,185,73,.28)',

              enableResize: true,
            },
          },

          grid: {
            vertLines: {
              color:
                'rgba(255,255,255,.032)',
            },

            horzLines: {
              color:
                'rgba(255,255,255,.04)',
            },
          },

          crosshair: {
            mode:
              CrosshairMode.Normal,

            vertLine: {
              color:
                'rgba(255,255,255,.30)',

              width: 1,
              style: 2,

              labelBackgroundColor:
                '#242a36',
            },

            horzLine: {
              color:
                'rgba(255,255,255,.22)',

              width: 1,
              style: 2,

              labelBackgroundColor:
                '#242a36',
            },
          },

          rightPriceScale: {
            borderVisible: false,

            scaleMargins: {
              top: 0.11,
              bottom: 0.10,
            },
          },

          timeScale: {
            borderVisible: false,

            timeVisible:
              range === '1d' ||
              range === '1w' ||
              range === '1m',

            secondsVisible: false,

            rightOffset: 2,

            barSpacing:
              range === '1d'
                ? 6
                : range === '1w'
                  ? 5
                  : range === 'all'
                    ? 0.25
                    : range === '5y'
                      ? 0.45
                      : 3,

            minBarSpacing:
              range === 'all'
                ? 0.03
                : range === '5y'
                  ? 0.06
                  : 0.2,
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


    let mainSeries:
      ISeriesApi<any>


    if (mode === 'candles') {
      mainSeries =
        chart.addSeries(
          CandlestickSeries,
          {
            upColor:
              '#14d981',

            downColor:
              '#ff5364',

            wickUpColor:
              '#14d981',

            wickDownColor:
              '#ff5364',

            borderVisible:
              false,

            priceFormat:
              pair === 'btc'
                ? {
                    type: 'price',
                    precision: 8,
                    minMove:
                      0.00000001,
                  }
                : {
                    type: 'price',
                    precision: 2,
                    minMove: 0.01,
                  },
          }
        )

      mainSeries.setData(
        result.data.map(
          (point) => ({
            time:
              point.time as UTCTimestamp,

            open:
              point.open,

            high:
              point.high,

            low:
              point.low,

            close:
              point.close,
          })
        )
      )
    } else {
      mainSeries =
        chart.addSeries(
          AreaSeries,
          {
            lineColor:
              accent,

            topColor:
              accentSoft,

            bottomColor:
              accentTransparent,

            lineWidth: 2,

            crosshairMarkerVisible:
              true,

            crosshairMarkerRadius:
              4,

            crosshairMarkerBorderColor:
              '#0b0e13',

            crosshairMarkerBackgroundColor:
              accent,

            priceLineVisible:
              true,

            priceLineColor:
              accent,

            priceLineWidth:
              1,

            lastValueVisible:
              true,

            priceFormat:
              pair === 'btc'
                ? {
                    type: 'price',
                    precision: 8,
                    minMove:
                      0.00000001,
                  }
                : {
                    type: 'price',
                    precision: 2,
                    minMove: 0.01,
                  },
          }
        )

      /*
       * Whitespace points are inserted
       * when the API identifies a real
       * historical gap.
       *
       * This prevents us from pretending
       * data existed when it did not.
       */
      const areaData: any[] = []

      result.data.forEach(
        (point, index) => {
          if (
            point.gap_before &&
            index > 0
          ) {
            const previous =
              result.data[
                index - 1
              ]

            const gapTime =
              previous.time +
              Math.min(
                result.interval_seconds,
                Math.max(
                  1,
                  Math.floor(
                    (
                      point.time -
                      previous.time
                    ) / 2
                  )
                )
              )

            areaData.push({
              time:
                gapTime as UTCTimestamp,
            })
          }

          areaData.push({
            time:
              point.time as UTCTimestamp,

            value:
              point.price,
          })
        }
      )

      mainSeries.setData(
        areaData
      )
    }


    chartRef.current = chart
    seriesRef.current =
      mainSeries


    /*
     * ATH line for the selected range.
     */
    if (ath) {
      mainSeries.createPriceLine({
        price: ath.price,

        color:
          'rgba(233,185,73,.72)',

        lineWidth: 1,

        lineStyle: 2,

        axisLabelVisible:
          true,

        title: 'HIGH',
      })

      try {
        createSeriesMarkers(
          mainSeries,
          [
            {
              time:
                ath.time as UTCTimestamp,

              position:
                'aboveBar',

              color:
                '#e9b949',

              shape:
                'circle',

              text:
                'HIGH',
            },
          ]
        )
      } catch (err) {
        console.debug(
          'Marker plugin:',
          err
        )
      }
    }


    let paneIndex = 1



    /*
     * RSI pane
     */
    if (showRSI) {
      const rsiSeries =
        chart.addSeries(
          LineSeries,
          {
            color:
              '#c397ff',

            lineWidth: 2,

            priceLineVisible:
              false,

            lastValueVisible:
              true,

            priceFormat: {
              type: 'price',
              precision: 1,
              minMove: 0.1,
            },
          },

          paneIndex
        )

      rsiSeries.setData(
        rsi(
          result.data,
          14
        )
      )

      rsiSeries.createPriceLine({
        price: 70,
        color:
          'rgba(255,83,100,.40)',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible:
          false,
        title: '70',
      })

      rsiSeries.createPriceLine({
        price: 30,
        color:
          'rgba(20,217,129,.40)',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible:
          false,
        title: '30',
      })

      paneIndex++
    }


    /*
     * MACD pane
     */
    if (showMACD) {
      const macd =
        calculateMACD(
          result.data
        )

      const macdSeries =
        chart.addSeries(
          LineSeries,
          {
            color:
              '#6fa8ff',

            lineWidth: 2,

            priceLineVisible:
              false,

            lastValueVisible:
              false,
          },

          paneIndex
        )

      macdSeries.setData(
        macd.macd
      )

      const signalSeries =
        chart.addSeries(
          LineSeries,
          {
            color:
              '#e9b949',

            lineWidth: 2,

            priceLineVisible:
              false,

            lastValueVisible:
              false,
          },

          paneIndex
        )

      signalSeries.setData(
        macd.signal
      )

      const histogram =
        chart.addSeries(
          HistogramSeries,
          {
            priceLineVisible:
              false,

            lastValueVisible:
              false,

            base: 0,
          },

          paneIndex
        )

      histogram.setData(
        macd.histogram.map(
          (point) => ({
            ...point,

            color:
              point.value >= 0
                ? 'rgba(20,217,129,.52)'
                : 'rgba(255,83,100,.52)',
          })
        )
      )
    }


    /*
     * Better hover / OHLC info
     */
    chart.subscribeCrosshairMove(
      (param) => {
        if (
          !param.time ||
          !param.point ||
          param.point.x < 0 ||
          param.point.y < 0
        ) {
          setHoverPrice(null)
          setHoverTime(null)
          setHoverPoint(null)
          return
        }

        const time =
          Number(param.time)

        const nearest =
          result.data.reduce(
            (
              best,
              point
            ) => {
              if (!best) {
                return point
              }

              return Math.abs(
                point.time -
                  time
              ) <
                Math.abs(
                  best.time -
                    time
                )
                ? point
                : best
            },
            null as Point | null
          )

        if (nearest) {
          setHoverPoint(
            nearest
          )

          setHoverPrice(
            nearest.close
          )

          setHoverTime(
            nearest.time
          )
        }
      }
    )


    /*
     * Simple free trend-line tool.
     *
     * Turn Trend on.
     * Click/tap two chart points.
     */
    const clickHandler =
      (param: any) => {
        if (
          !drawTrendRef.current ||
          !param.time ||
          !param.point
        ) {
          return
        }

        const price =
          mainSeries.coordinateToPrice(
            param.point.y
          )

        if (
          price === null ||
          price === undefined
        ) {
          return
        }

        const point:
          TrendPoint = {
            time:
              Number(param.time),

            price:
              Number(price),
          }

        const existing =
          pendingTrendRef.current

        if (!existing) {
          setPendingTrend(
            point
          )

          pendingTrendRef.current =
            point

          return
        }

        setTrendLines(
          (lines) => [
            ...lines,
            {
              id:
                Date.now(),
              a:
                existing,
              b:
                point,
            },
          ]
        )

        setPendingTrend(null)
        pendingTrendRef.current =
          null
      }


    chart.subscribeClick(
      clickHandler
    )


    const redraw =
      () => {
        setTrendVersion(
          (value) =>
            value + 1
        )
      }


    chart
      .timeScale()
      .subscribeVisibleLogicalRangeChange(
        redraw
      )


    /*
     * Fit the full selected period.
     *
     * ALL and 5Y have a deliberately tiny
     * minBarSpacing so the whole history
     * can actually fit on a phone.
     */
    requestAnimationFrame(
      () => {
        chart
          .timeScale()
          .fitContent()
      }
    )


    const resizeObserver =
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

            baseHeight +
              extraHeight
          )

          redraw()
        }
      )


    resizeObserver.observe(
      chartContainer.current
    )


    return () => {
      resizeObserver.disconnect()

      try {
        chart.unsubscribeClick(
          clickHandler
        )
      } catch {}

      try {
        chart
          .timeScale()
          .unsubscribeVisibleLogicalRangeChange(
            redraw
          )
      } catch {}

      chart.remove()

      chartRef.current = null
      seriesRef.current = null
    }
  }, [
    result,
    mode,
    pair,
    range,
    showRSI,
    showMACD,
    ath,
  ])


  function fitChart() {
    chartRef.current
      ?.timeScale()
      .fitContent()

    setTrendVersion(
      (value) =>
        value + 1
    )
  }


  function clearDrawings() {
    setTrendLines([])
    setPendingTrend(null)
  }


  function trendCoordinates(
    line: TrendLine
  ) {
    void trendVersion

    const chart =
      chartRef.current

    const series =
      seriesRef.current

    if (!chart || !series) {
      return null
    }

    const x1 =
      chart
        .timeScale()
        .timeToCoordinate(
          line.a
            .time as UTCTimestamp
        )

    const x2 =
      chart
        .timeScale()
        .timeToCoordinate(
          line.b
            .time as UTCTimestamp
        )

    const y1 =
      series.priceToCoordinate(
        line.a.price
      )

    const y2 =
      series.priceToCoordinate(
        line.b.price
      )

    if (
      x1 === null ||
      x2 === null ||
      y1 === null ||
      y2 === null
    ) {
      return null
    }

    return {
      x1,
      y1,
      x2,
      y2,
    }
  }


  function latestPriceCoordinates() {
    /*
     * trendVersion intentionally forces this
     * coordinate calculation to run again after
     * zooming, panning, fitting, or resizing.
     */
    void trendVersion

    const chart =
      chartRef.current

    const series =
      seriesRef.current

    if (
      !chart ||
      !series ||
      !result ||
      !result.data.length ||
      !chartContainer.current
    ) {
      return null
    }

    const point =
      result.data[
        result.data.length - 1
      ]

    const x =
      chart
        .timeScale()
        .timeToCoordinate(
          point.time as UTCTimestamp
        )

    const y =
      series.priceToCoordinate(
        point.close
      )

    if (
      x === null ||
      y === null
    ) {
      return null
    }

    /*
     * Do not display the pulse if the latest
     * price has been panned outside the visible
     * chart area.
     */
    const width =
      chartContainer.current.clientWidth

    const height =
      chartContainer.current.clientHeight

    if (
      x < 0 ||
      x > width ||
      y < 0 ||
      y > height
    ) {
      return null
    }

    return {
      x,
      y,
    }
  }


  const latestPricePoint =
    latestPriceCoordinates()


  const displayPrice =
    hoverPrice !== null
      ? hoverPrice
      : result?.latest.price ??
        null


  const positive =
    (
      result?.period.change ??
      0
    ) >= 0


  const calculator =
    useMemo(() => {
      if (
        !allHistory.length ||
        !result ||
        !calculatorDate
      ) {
        return null
      }

      const amount =
        Number(
          calculatorAmount
        )

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {
        return null
      }

      const wanted =
        new Date(
          `${calculatorDate}T12:00:00`
        ).getTime() /
        1000

      let nearest =
        allHistory[0]

      allHistory.forEach(
        (point) => {
          if (
            Math.abs(
              point.time -
                wanted
            ) <
            Math.abs(
              nearest.time -
                wanted
            )
          ) {
            nearest = point
          }
        }
      )

      const thenValue =
        amount *
        nearest.close

      const nowValue =
        amount *
        result.latest.price

      const change =
        thenValue === 0
          ? 0
          : (
              (
                nowValue -
                thenValue
              ) /
              thenValue
            ) *
            100

      return {
        amount,
        point:
          nearest,
        thenValue,
        nowValue,
        change,
      }
    }, [
      allHistory,
      calculatorAmount,
      calculatorDate,
      result,
    ])


  const firstHistoryDate =
    allHistory.length
      ? new Date(
          allHistory[0].time *
            1000
        )
          .toISOString()
          .slice(0, 10)
      : undefined


  const today =
    new Date()
      .toISOString()
      .slice(0, 10)


  return (
    <main className="page">

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="shell">

        
        <header className="site-header">

          <a
            href="/app/"
            className="brand"
          >
            <img
              className="coinmark"
              src="/app/sumcoin-logo.png"
              alt="Sumcoin"
            />

            <div>
              <div className="brand-title">
                Sumcoin
              </div>

              <div className="brand-subtitle">
                SUMCOIN PRICE
              </div>
            </div>
          </a>


          <nav className="desktop-nav">

            <a href="#price">
              Price
            </a>

            <a href="#why">
              Why Sumcoin
            </a>

            <a href="#ecosystem">
              Ecosystem
            </a>

            <a href="#performance">
              Performance
            </a>

          </nav>


          <div className="pair-switch">

            <button
              className={
                pair === 'usd'
                  ? 'selected'
                  : ''
              }
              onClick={() =>
                setPair('usd')
              }
            >
              SUM / USD
            </button>

            <button
              className={
                pair === 'btc'
                  ? 'selected'
                  : ''
              }
              onClick={() =>
                setPair('btc')
              }
            >
              SUM / BTC
            </button>

          </div>

        </header>



        <section className="market-card" id="price">

          <div className="market-head">

            <div>

              <div className="ticker-row">

                <span className="ticker">
                  SUM
                </span>

                <span className="live-dot">
                  <span />
                  LIVE
                </span>

                {result?.latest.stale && (
                  <span className="stale">
                    DATA DELAYED
                  </span>
                )}

              </div>


              <div className="price">
                {displayPrice !== null
                  ? formatPrice(
                      displayPrice,
                      pair
                    )
                  : '—'}
              </div>


              {hoverTime !== null &&
              result ? (

                <div className="hover-date">
                  {formatDate(
                    hoverTime,
                    range
                  )}
                </div>

              ) : result ? (

                <div
                  className={`change ${
                    positive
                      ? 'up'
                      : 'down'
                  }`}
                >

                  <span>
                    {formatChange(
                      result.period
                        .change,
                      pair
                    )}
                  </span>

                  <span>
                    {formatPercent(
                      result.period
                        .change_percent
                    )}
                  </span>

                  <span className="period-label">
                    {
                      ranges.find(
                        (item) =>
                          item.key ===
                          range
                      )?.label
                    }
                  </span>

                </div>

              ) : (

                <div className="change">
                  Loading market data…
                </div>

              )}

            </div>


            <div className="chart-mode">

              <button
                className={
                  mode === 'line'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setMode('line')
                }
              >
                Line
              </button>

              <button
                className={
                  mode === 'candles'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setMode(
                    'candles'
                  )
                }
              >
                Candles
              </button>

            </div>

          </div>


          <div className="chart-toolbar">

            <div className="tool-group">

              <span className="tool-label">
                INDICATORS
              </span>

              <button
                className={
                  showRSI
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setShowRSI(
                    !showRSI
                  )
                }
              >
                RSI
              </button>

              <button
                className={
                  showMACD
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setShowMACD(
                    !showMACD
                  )
                }
              >
                MACD
              </button>

            </div>


            <div className="tool-group chart-actions">

              <button
                className={
                  drawTrend
                    ? 'active trend-active'
                    : ''
                }
                onClick={() =>
                  setDrawTrend(
                    !drawTrend
                  )
                }
              >
                ↗ Trend
              </button>

              <button
                onClick={
                  clearDrawings
                }
                disabled={
                  trendLines.length ===
                    0 &&
                  !pendingTrend
                }
              >
                Clear
              </button>

              <button
                className="fit-button"
                onClick={
                  fitChart
                }
              >
                ⛶ Fit
              </button>

            </div>

          </div>


          {drawTrend && (
            <div className="drawing-hint">
              {pendingTrend
                ? 'Tap the second chart point to finish the trend line.'
                : 'Trend tool: tap any two chart points.'}
            </div>
          )}


          {hoverPoint && (
            <div className="ohlc-strip">

              <span>
                O&nbsp;
                <strong>
                  {formatCompactPrice(
                    hoverPoint.open,
                    pair
                  )}
                </strong>
              </span>

              <span>
                H&nbsp;
                <strong>
                  {formatCompactPrice(
                    hoverPoint.high,
                    pair
                  )}
                </strong>
              </span>

              <span>
                L&nbsp;
                <strong>
                  {formatCompactPrice(
                    hoverPoint.low,
                    pair
                  )}
                </strong>
              </span>

              <span>
                C&nbsp;
                <strong>
                  {formatCompactPrice(
                    hoverPoint.close,
                    pair
                  )}
                </strong>
              </span>

              <span>
                Samples&nbsp;
                <strong>
                  {
                    hoverPoint.samples
                  }
                </strong>
              </span>

            </div>
          )}


          <div
            className={`chart-wrap ${
              drawTrend
                ? 'drawing-mode'
                : ''
            }`}
          >

            {loading && (
              <div className="chart-message">
                <div className="spinner" />
                Loading Sumcoin history…
              </div>
            )}

            {error && (
              <div className="chart-message error-message">
                {error}
              </div>
            )}

            <div
              ref={
                chartContainer
              }
              className={`chart ${
                loading ||
                error
                  ? 'chart-hidden'
                  : ''
              }`}
            />


            {latestPricePoint &&
              !loading &&
              !error && (

                <div
                  className={`latest-price-pulse ${
                    result &&
                    result.period.change >= 0
                      ? 'latest-price-pulse-up'
                      : 'latest-price-pulse-down'
                  }`}
                  style={{
                    left:
                      `${latestPricePoint.x}px`,

                    top:
                      `${latestPricePoint.y}px`,
                  }}
                  aria-hidden="true"
                >
                  <span className="latest-price-pulse-ring" />
                  <span className="latest-price-pulse-core" />
                </div>

              )}


            <svg
              className="trend-overlay"
            >

              {trendLines.map(
                (line) => {
                  const coords =
                    trendCoordinates(
                      line
                    )

                  if (!coords) {
                    return null
                  }

                  return (
                    <line
                      key={
                        line.id
                      }
                      x1={
                        coords.x1
                      }
                      y1={
                        coords.y1
                      }
                      x2={
                        coords.x2
                      }
                      y2={
                        coords.y2
                      }
                      className="trend-line"
                    />
                  )
                }
              )}

            </svg>

          </div>


          <div className="range-row">

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


          <div className="stats">

            <div className="stat">
              <span>
                Period high
              </span>

              <strong>
                {result
                  ? formatPrice(
                      result.period
                        .high,
                      pair
                    )
                  : '—'}
              </strong>
            </div>


            <div className="stat">
              <span>
                Period low
              </span>

              <strong>
                {result
                  ? formatPrice(
                      result.period
                        .low,
                      pair
                    )
                  : '—'}
              </strong>
            </div>


            <div className="stat">
              <span>
                Open
              </span>

              <strong>
                {result
                  ? formatPrice(
                      result.period
                        .open,
                      pair
                    )
                  : '—'}
              </strong>
            </div>


            <div className="stat">
              <span>
                Resolution
              </span>

              <strong>
                {result?.resolution
                  .toUpperCase() ??
                  '—'}
              </strong>
            </div>

          </div>

        </section>


        <section className="section" id="performance">

          <div className="section-heading">
            <div>
              <span className="eyebrow">
                PERFORMANCE
              </span>

              <h2>
                Sumcoin at a glance
              </h2>
            </div>
          </div>


          <div className="performance-grid">

            {[
              ['24 Hours', '1d'],
              ['7 Days', '1w'],
              ['30 Days', '1m'],
              ['1 Year', '1y'],
              ['5 Years', '5y'],
              ['All Time', 'all'],
            ].map(
              ([label, key]) => {
                const data =
                  performance[
                    key as Range
                  ]

                const change =
                  data?.period
                    .change_percent

                return (
                  <div
                    className="performance-card"
                    key={
                      key
                    }
                  >

                    <span>
                      {label}
                    </span>

                    <strong
                      className={
                        change ===
                        undefined
                          ? ''
                          : change >=
                              0
                            ? 'up'
                            : 'down'
                      }
                    >
                      {change ===
                      undefined
                        ? '—'
                        : formatPercent(
                            change
                          )}
                    </strong>

                  </div>
                )
              }
            )}

          </div>


          <div className="market-summary-grid">

            <div className="summary-card">

              <span>
                Current index rate
              </span>

              <strong>
                {result
                  ? formatPrice(
                      result.latest
                        .price,
                      pair
                    )
                  : '—'}
              </strong>

            </div>


            <div className="summary-card">

              <span>
                All-time high
              </span>

              <strong>
                {allTimeHigh
                  ? formatPrice(
                      allTimeHigh.price,
                      pair
                    )
                  : '—'}
              </strong>

              {allTimeHigh && (
                <small>
                  {
                    formatShortDate(
                      allTimeHigh.time
                    )
                  }
                </small>
              )}

            </div>


            <div className="summary-card">

              <span>
                From all-time high
              </span>

              <strong
                className={
                  allTimeHigh &&
                  result &&
                  result.latest
                    .price >=
                    allTimeHigh.price
                    ? 'up'
                    : 'down'
                }
              >
                {allTimeHigh &&
                result
                  ? formatPercent(
                      (
                        (
                          result
                            .latest
                            .price -
                          allTimeHigh
                            .price
                        ) /
                        allTimeHigh
                          .price
                      ) *
                        100
                    )
                  : '—'}
              </strong>

            </div>

          </div>

        </section>


        <section className="section philosophy-section" id="why">

          <div className="philosophy-hero">

            <span className="eyebrow">
              WHY SUMCOIN?
            </span>

            <h2>
              Digital currency was supposed to be
              <span className="gold-text">
                peer to peer.
              </span>
            </h2>

            <p className="philosophy-lead">
              Bitcoin introduced a powerful idea: electronic cash that could move directly from one person to another without requiring a bank, payment company or other financial institution to approve the transaction. Sumcoin begins from that same peer-to-peer premise, but asks what happens when a cryptocurrency becomes dependent on centralized exchanges for custody, access and price discovery.
            </p>

            <p>
              Sumcoin was built around the belief that cryptocurrency drifted away from that original purpose as centralized exchanges became the primary place where coins were bought, sold, stored and valued. When an exchange becomes the center of the ecosystem, users once again depend on an intermediary. Sumcoin was designed so that the currency can continue to exist, move and have a reference value without requiring that intermediary.
            </p>

            <p>
              Sumcoin takes a different approach. The Sumcoin Index supplies an independent reference rate, while the blockchain handles settlement and self-custody wallets allow users to control and transfer SUM themselves. The objective is straightforward: one person should be able to hold SUM, determine its reference value and send it directly to another person without first depositing it with a centralized exchange.
            </p>

            <div className="philosophy-actions">

              <a
                href="https://www.sumcoinindex.com/white-paper.html"
                target="_blank"
                rel="noreferrer"
                className="primary-action"
              >
                Read the Sumcoin White Paper
                <span>↗</span>
              </a>

              <a
                href="https://cryptocurrency.fandom.com/wiki/Sumcoin"
                target="_blank"
                rel="noreferrer"
              >
                Sumcoin Wiki
                <span>↗</span>
              </a>

            </div>

          </div>


          <div className="principle-grid">

            <article>

              <span className="principle-number">
                01
              </span>

              <h3>
                Indexed value
              </h3>

              <p>
                SUM is not intended to depend on the last speculative trade on one exchange to determine its reference value. The Sumcoin Index provides the ecosystem's reference rate.
              </p>

            </article>


            <article>

              <span className="principle-number">
                02
              </span>

              <h3>
                Self custody
              </h3>

              <p>
                Users hold their own wallet keys. Sending SUM does not require depositing the currency with a centralized exchange or surrendering custody to a broker.
              </p>

            </article>


            <article>

              <span className="principle-number">
                03
              </span>

              <h3>
                Direct exchange
              </h3>

              <p>
                People can negotiate value directly and transfer SUM wallet-to-wallet. The currency is intended to function as money between peers rather than merely an asset held on an exchange.
              </p>

            </article>

          </div>


          <div className="exchange-explainer">

            <div>

              <span className="eyebrow">
                WHY ISN'T SUMCOIN CENTERED ON EXCHANGES?
              </span>

              <h2>
                Because the exchange is not supposed to be the product.
              </h2>

            </div>

            <div>

              <p>
                A centralized exchange introduces a custodian between users and usually allows exchange trading activity to become the dominant source of price discovery.
              </p>

              <p>
                Sumcoin's design thesis is different: preserve an independent indexed reference rate, let users retain custody of their coins, and let people transact directly.
              </p>

              <p>
                Exchange access and true peer-to-peer use are not necessarily technically incompatible, but Sumcoin's core utility does not depend on an exchange existing.
              </p>

            </div>

          </div>

        </section>


        <section className="section" id="ecosystem">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                SUMCOIN ECOSYSTEM
              </span>

              <h2>
                Hold it. Verify it. Use it.
              </h2>

              <p>
                Three simple pieces make the peer-to-peer Sumcoin ecosystem understandable.
              </p>

            </div>

          </div>


          <div className="ecosystem-grid">

            <a
              href="https://sumcoinwallet.org/"
              target="_blank"
              rel="noreferrer"
              className="ecosystem-card"
            >

              <div className="ecosystem-icon ecosystem-icon-wallet">
                <img
                  src="/app/sumcoin-wallet-logo.webp"
                  alt="Sumcoin Wallet"
                />
              </div>

              <span className="eyebrow">
                WALLET
              </span>

              <h3>
                Sumcoin Wallet
              </h3>

              <p>
                The Sumcoin Wallet is the primary way to hold and use SUM without handing custody to a centralized service. Your recovery phrase represents control of the wallet. From the wallet you can receive SUM from another person, hold it yourself, view its indexed reference value and send it directly to another Sumcoin address.
              </p>

              <strong>
                Get the wallet →
              </strong>

            </a>


            <a
              href="https://sumexplorer.com/"
              target="_blank"
              rel="noreferrer"
              className="ecosystem-card"
            >

              <div className="ecosystem-icon">
                ◎
              </div>

              <span className="eyebrow">
                BLOCKCHAIN
              </span>

              <h3>
                SumExplorer
              </h3>

              <p>
                SumExplorer is the public window into the Sumcoin blockchain. It allows anyone to independently inspect transactions, addresses, blocks and confirmations rather than simply trusting what a wallet or website says happened. It is useful for verifying that a payment was broadcast, confirmed and permanently recorded by the network.
              </p>

              <strong>
                Explore the blockchain →
              </strong>

            </a>


            <a
              href="https://sumcoinmarketplace.com/"
              target="_blank"
              rel="noreferrer"
              className="ecosystem-card marketplace-card"
            >

              <div className="ecosystem-icon">
                ↔
              </div>

              <span className="eyebrow">
                USE SUM
              </span>

              <h3>
                Sumcoin Marketplace
              </h3>

              <p>
                Sumcoin Marketplace demonstrates the practical side of a peer-to-peer currency. Buyers and sellers can discover one another, communicate directly and negotiate the terms of a transaction themselves. Instead of requiring a centralized cryptocurrency exchange to sit between the two parties, SUM can move directly from the buyer's wallet to the seller's wallet as payment.
              </p>

              <strong>
                Visit the marketplace →
              </strong>

            </a>

          </div>

        </section>


        <MarketSnapshot />

      <ComparisonChart />


<section className="section resource-section">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                RESOURCES
              </span>

              <h2>
                Explore Sumcoin
              </h2>

            </div>

          </div>



          <div className="resource-links">

            <a
              href="https://www.sumcoin.org/"
              target="_blank"
              rel="noreferrer"
            >
              Sumcoin.org
              <span>↗</span>
            </a>

            <a
              href="https://sumcoinwallet.org/"
              target="_blank"
              rel="noreferrer"
            >
              Wallet
              <span>↗</span>
            </a>

            <a
              href="https://sumexplorer.com/"
              target="_blank"
              rel="noreferrer"
            >
              Explorer
              <span>↗</span>
            </a>

            <a
              href="https://sumcoinmarketplace.com/"
              target="_blank"
              rel="noreferrer"
            >
              Marketplace
              <span>↗</span>
            </a>

            <a
              href="https://www.sumcoinindex.com/white-paper.html"
              target="_blank"
              rel="noreferrer"
            >
              White Paper
              <span>↗</span>
            </a>

            <a
              href="https://cryptocurrency.fandom.com/wiki/Sumcoin"
              target="_blank"
              rel="noreferrer"
            >
              Fandom Wiki
              <span>↗</span>
            </a>

            <a
              href="https://github.com/sumcoinlabs"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
              <span>↗</span>
            </a>

            <a
              href="/app/api/history.php?range=1d"
              target="_blank"
              rel="noreferrer"
            >
              Price API
              <span>↗</span>
            </a>

          </div>


        </section>


        
        <section className="section calculator-section">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                HISTORICAL VALUE
              </span>

              <h2>
                If you held SUM…
              </h2>

              <p>
                See the historical index value of a SUM holding and compare it with today.
              </p>

            </div>

          </div>


          <div className="calculator-card">

            <div className="calculator-inputs">

              <label>

                SUM amount

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    calculatorAmount
                  }
                  onChange={(e) =>
                    setCalculatorAmount(
                      e.target.value
                    )
                  }
                />

              </label>


              <label>

                Starting date

                <input
                  type="date"
                  min={
                    firstHistoryDate
                  }
                  max={
                    today
                  }
                  value={
                    calculatorDate
                  }
                  onChange={(e) =>
                    setCalculatorDate(
                      e.target.value
                    )
                  }
                />

              </label>

            </div>


            {calculator && (

              <div className="calculator-results">

                <div>

                  <span>
                    Historical date
                  </span>

                  <strong>
                    {
                      formatShortDate(
                        calculator
                          .point.time
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Value then
                  </span>

                  <strong>
                    {
                      formatPrice(
                        calculator
                          .thenValue,
                        pair
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Value now
                  </span>

                  <strong>
                    {
                      formatPrice(
                        calculator
                          .nowValue,
                        pair
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Change
                  </span>

                  <strong
                    className={
                      calculator
                        .change >=
                      0
                        ? 'up'
                        : 'down'
                    }
                  >
                    {
                      formatPercent(
                        calculator
                          .change
                      )
                    }
                  </strong>

                </div>

              </div>

            )}

          </div>

        </section>


        <footer className="site-footer">

          <div className="footer-brand">

            <img
              src="/app/sumcoin-logo.png"
              alt="Sumcoin"
            />

            <div>

              <strong>
                Sumcoin
              </strong>

              <p>
                An index-based cryptocurrency built around self custody and direct peer-to-peer exchange.
              </p>

            </div>

          </div>


          <div className="footer-columns">

            <div>

              <span>
                USE SUM
              </span>

              <a
                href="https://sumcoinwallet.org/"
                target="_blank"
                rel="noreferrer"
              >
                Wallet
              </a>

              <a
                href="https://sumcoinmarketplace.com/"
                target="_blank"
                rel="noreferrer"
              >
                Marketplace
              </a>

            </div>


            <div>

              <span>
                NETWORK
              </span>

              <a
                href="https://sumexplorer.com/"
                target="_blank"
                rel="noreferrer"
              >
                Explorer
              </a>

              <a
                href="https://github.com/sumcoinlabs"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>

            </div>


            <div>

              <span>
                LEARN
              </span>

              <a
                href="https://www.sumcoinindex.com/white-paper.html"
                target="_blank"
                rel="noreferrer"
              >
                White Paper
              </a>

              <a
                href="https://cryptocurrency.fandom.com/wiki/Sumcoin"
                target="_blank"
                rel="noreferrer"
              >
                Wiki
              </a>

            </div>

          </div>


          <div className="footer-bottom">

            <span>
              SUMCOIN PRICE
            </span>

            <span>
              Historical index data since 2019
            </span>

          </div>

        </footer>


      </div>

    </main>
  )
}


export default App
