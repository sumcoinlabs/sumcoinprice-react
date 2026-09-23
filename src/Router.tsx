import App from './App'
import './App.css'
import {
  AboutPage,
  IndexPage,
  HistoryPage,
  EcosystemPage,
} from './ContentPages'

import {
  BuyPage,
  CalculatorPage,
  ComparePage,
} from './UtilityPages'

type RouterProps = {
  pathname: string
}

function normalizePath(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/'
  }

  return `/${pathname.replace(/^\/+|\/+$/g, '')}/`
}

function NotFound() {
  return (
    <main className="page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="shell">
        <header className="site-header">
          <a href="/" className="brand">
            <img
              className="coinmark"
              src="/sumcoin-logo.png"
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
        </header>

        <section style={{padding: '120px 0'}}>
          <div style={{
            maxWidth: '760px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              color: 'var(--gold)',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '.15em',
              marginBottom: '18px'
            }}>
              PAGE NOT FOUND
            </div>

            <h1 style={{
              fontSize: 'clamp(42px,7vw,76px)',
              lineHeight: 1,
              margin: '0 0 22px'
            }}>
              Nothing here yet.
            </h1>

            <p style={{
              color: 'var(--muted)',
              fontSize: '18px',
              lineHeight: 1.7
            }}>
              Return to the Sumcoin market dashboard.
            </p>

            <p style={{marginTop: '32px'}}>
              <a href="/" style={{color: 'var(--gold)'}}>
                Back to SumcoinPrice
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default function Router({
  pathname,
}: RouterProps) {
  const path = normalizePath(pathname)

  switch (path) {
    case '/':
      return <App />

    case '/about/':
      return <AboutPage />

    case '/index/':
      return <IndexPage />

    case '/history/':
      return <HistoryPage />

    case '/ecosystem/':
      return <EcosystemPage />

    case '/buy/':
      return <BuyPage />

    case '/calculator/':
      return <CalculatorPage />

    case '/sumcoin-vs-bitcoin/':
      return <ComparePage />

    default:
      return <NotFound />
  }
}
