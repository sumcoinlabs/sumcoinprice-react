import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

import './index.css'

import Router from './Router.tsx'

import {
  MarketDataProvider,
  type MarketData,
} from './MarketTools'

function readInitialMarket():
  MarketData | null
{
  const node =
    document.getElementById(
      'sumcoin-market-state'
    )

  if (!node?.textContent) {
    return null
  }

  try {
    return JSON.parse(
      node.textContent
    ) as MarketData
  } catch {
    return null
  }
}

const initialMarket =
  readInitialMarket()

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <MarketDataProvider
      initialMarket={initialMarket}
    >
      <Router
        pathname={
          window.location.pathname
        }
      />
    </MarketDataProvider>
  </StrictMode>
)
