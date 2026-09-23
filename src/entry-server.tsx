import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'

import Router from './Router'

import {
  MarketDataProvider,
  type MarketData,
} from './MarketTools'

export function render(
  pathname = '/',
  initialMarket:
    MarketData | null = null
) {
  return renderToString(
    <StrictMode>
      <MarketDataProvider
        initialMarket={initialMarket}
      >
        <Router pathname={pathname} />
      </MarketDataProvider>
    </StrictMode>
  )
}
