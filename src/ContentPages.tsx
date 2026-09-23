import './ContentPages.css'

type NavItem = {
  href: string
  label: string
}

const nav: NavItem[] = [
  { href: '/', label: 'Price' },
  { href: '/buy/', label: 'Buy' },
  { href: '/calculator/', label: 'Calculator' },
  { href: '/sumcoin-vs-bitcoin/', label: 'SUM vs BTC' },
  { href: '/history/', label: 'History' },
  { href: '/index/', label: 'Index' },
  { href: '/ecosystem/', label: 'Ecosystem' },
]

function PageHeader() {
  return (
    <header className="content-header">
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

      <nav className="content-nav">
        {nav.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

function PageFooter() {
  return (
    <footer className="content-footer">
      <div>
        <strong>SumcoinPrice</strong>
        <span>
          Market data, history and context for the Sumcoin Index.
        </span>
      </div>

      <div className="footer-links">
        <a href="/">Live Price</a>
        <a href="https://sumcoin.org/">Sumcoin</a>
        <a href="https://sumcoinwallet.org/">Wallet</a>
        <a href="https://sumexplorer.com/">Explorer</a>
      </div>
    </footer>
  )
}

export function PageShell({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string
  title: string
  lead: string
  children: React.ReactNode
}) {
  return (
    <main className="page content-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="shell">
        <PageHeader />

        <section className="content-hero">
          <div className="content-eyebrow">
            {eyebrow}
          </div>

          <h1>{title}</h1>

          <p className="content-lead">
            {lead}
          </p>
        </section>

        {children}

        <PageFooter />
      </div>
    </main>
  )
}

export function FeatureGrid({
  items,
}: {
  items: Array<{
    number?: string
    title: string
    text: string
  }>
}) {
  return (
    <div className="feature-grid">
      {items.map((item) => (
        <article className="feature-card" key={item.title}>
          {item.number && (
            <div className="feature-number">
              {item.number}
            </div>
          )}

          <h2>{item.title}</h2>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  )
}

export function Section({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="content-section">
      <div className="section-kicker">{label}</div>
      <h2 className="section-title">{title}</h2>
      <div className="section-copy">{children}</div>
    </section>
  )
}

export function AboutPage() {
  return (
    <PageShell
      eyebrow="UNDERSTANDING SUMCOIN"
      title="A digital currency built around indexed value."
      lead="Sumcoin combines peer-to-peer digital currency with an index-based reference value, giving SUM a different approach to price discovery than assets that depend on one exchange or trading venue."
    >
      <FeatureGrid
        items={[
          {
            number: '01',
            title: 'Indexed value',
            text: 'SUM uses the Sumcoin Index as its reference value. The goal is to represent a broader market view rather than treating one centralized exchange as the single source of truth.',
          },
          {
            number: '02',
            title: 'Self-custody',
            text: 'SUM can be held directly in a Sumcoin wallet. Ownership does not require leaving the asset deposited with a centralized exchange.',
          },
          {
            number: '03',
            title: 'Peer-to-peer transfer',
            text: 'Sumcoin is designed to move directly between wallets over its blockchain, preserving the peer-to-peer model that originally defined cryptocurrency.',
          },
        ]}
      />

      <Section
        label="THE IDEA"
        title="The currency is the product."
      >
        <p>
          Cryptocurrency began with a simple idea: electronic
          value could move directly from one person to another
          without requiring a financial institution in the middle.
        </p>

        <p>
          Over time, centralized exchanges became the dominant
          place where many digital assets were bought, sold, held
          and priced. Sumcoin approaches that relationship
          differently. The network, the wallet and the currency
          can function independently of an exchange account.
        </p>

        <blockquote>
          The exchange does not have to be the product.
          The currency can be the product.
        </blockquote>
      </Section>

      <Section
        label="SUMCOINPRICE"
        title="Why this site exists."
      >
        <p>
          SumcoinPrice is the market-data interface for the
          Sumcoin Index. It combines current SUM pricing with
          historical charts, market statistics, purchasing-power
          comparisons and ecosystem resources.
        </p>

        <p>
          The goal is not just to display a current quote. It is
          to make the long-term behavior of SUM easier to examine
          and put that behavior into context.
        </p>
      </Section>

      <div className="cta-panel">
        <div>
          <span>LIVE MARKET DATA</span>
          <h2>See SUM in real time.</h2>
        </div>

        <a href="/" className="content-button">
          Open market dashboard →
        </a>
      </div>
    </PageShell>
  )
}

export function IndexPage() {
  return (
    <PageShell
      eyebrow="SUMCOIN INDEX"
      title="One reference value. Broader market context."
      lead="The Sumcoin Index provides the reference value used for SUM pricing. SumcoinPrice presents that value alongside historical market information so the current quote can be understood in context."
    >
      <div className="index-flow">
        <div className="flow-node">
          <span>01</span>
          <strong>Market inputs</strong>
          <p>
            Market information is observed from the broader
            cryptocurrency environment.
          </p>
        </div>

        <div className="flow-arrow">→</div>

        <div className="flow-node featured">
          <span>02</span>
          <strong>Sumcoin Index</strong>
          <p>
            The index produces the reference value used to
            represent SUM.
          </p>
        </div>

        <div className="flow-arrow">→</div>

        <div className="flow-node">
          <span>03</span>
          <strong>SUM reference price</strong>
          <p>
            SumcoinPrice publishes the resulting value with
            historical and market context.
          </p>
        </div>
      </div>

      <Section
        label="WHY AN INDEX"
        title="Price discovery without depending on one venue."
      >
        <p>
          A cryptocurrency traded primarily through a single
          exchange can become closely tied to the liquidity,
          availability and behavior of that venue. An index-based
          approach is intended to provide a reference value that
          is not defined solely by one trading location.
        </p>

        <p>
          That distinction matters because the blockchain and the
          currency can continue to function whether or not a
          particular exchange is available.
        </p>
      </Section>

      <FeatureGrid
        items={[
          {
            title: 'Live reference rate',
            text: 'The current SUM/USD reference value is presented on the SumcoinPrice dashboard and updated from the Sumcoin market-data feed.',
          },
          {
            title: 'Historical observations',
            text: 'Historical SUM/USD and SUM/BTC data allow the current index value to be viewed against prior market conditions.',
          },
          {
            title: 'Market context',
            text: 'Price, market capitalization, supply, volume and comparative performance provide context that a standalone quote cannot.',
          },
        ]}
      />

      <div className="cta-panel">
        <div>
          <span>EXPLORE THE DATA</span>
          <h2>Follow the index through time.</h2>
        </div>

        <a href="/history/" className="content-button">
          Explore SUM history →
        </a>
      </div>
    </PageShell>
  )
}

export function HistoryPage() {
  return (
    <PageShell
      eyebrow="SUM MARKET HISTORY"
      title="The current price is only one point in the story."
      lead="SumcoinPrice preserves historical SUM market data so today's index value can be compared with earlier periods, long-term performance and changes in purchasing power."
    >
      <div className="history-strip">
        <div>
          <span>PRICE</span>
          <strong>SUM / USD</strong>
          <small>Historical reference value</small>
        </div>

        <div>
          <span>RELATIVE VALUE</span>
          <strong>SUM / BTC</strong>
          <small>Performance in Bitcoin terms</small>
        </div>

        <div>
          <span>CONTEXT</span>
          <strong>Normalized to 100</strong>
          <small>Cross-asset comparison</small>
        </div>

        <div>
          <span>PURCHASING POWER</span>
          <strong>U.S. CPI</strong>
          <small>Real-world monetary context</small>
        </div>
      </div>

      <Section
        label="HISTORICAL DATA"
        title="A chart should show more than the latest move."
      >
        <p>
          The main SumcoinPrice interface includes multiple
          historical timeframes, candlestick and line charts,
          OHLC data, crosshair inspection and technical indicators.
        </p>

        <p>
          Historical analysis is especially important for an
          asset whose current nominal price can look very different
          from earlier periods. Long-term data makes it possible
          to see drawdowns, recoveries, trend changes and major
          price regimes instead of judging SUM from one snapshot.
        </p>
      </Section>

      <FeatureGrid
        items={[
          {
            number: '1Y',
            title: 'Recent market cycle',
            text: 'A one-year view emphasizes recent market structure, momentum and shorter-term changes in the SUM reference value.',
          },
          {
            number: '5Y',
            title: 'Longer-term behavior',
            text: 'Multi-year views reduce the importance of short-lived volatility and make larger changes in value easier to see.',
          },
          {
            number: 'ALL',
            title: 'Full historical context',
            text: 'The all-time view provides the broadest perspective and preserves the distinction between a local period high and the true historical all-time high.',
          },
        ]}
      />

      <Section
        label="RELATIVE PERFORMANCE"
        title="Different assets need a common starting point."
      >
        <p>
          SumcoinPrice can normalize SUM, Bitcoin, gold, silver
          and U.S. dollar purchasing power to the same starting
          value of 100. This removes the distraction of radically
          different nominal prices.
        </p>

        <p>
          A move from 100 to 150 represents a 50% gain regardless
          of whether the underlying asset began at one dollar,
          one thousand dollars or one hundred thousand dollars.
        </p>
      </Section>

      <div className="cta-panel">
        <div>
          <span>INTERACTIVE HISTORY</span>
          <h2>Use the full market dashboard.</h2>
        </div>

        <a href="/#performance" className="content-button">
          View performance charts →
        </a>
      </div>
    </PageShell>
  )
}

export function EcosystemPage() {
  return (
    <PageShell
      eyebrow="SUMCOIN ECOSYSTEM"
      title="The network is bigger than a price chart."
      lead="SumcoinPrice connects market information with the tools used to hold, inspect and interact with SUM across the broader Sumcoin ecosystem."
    >
      <div className="ecosystem-grid">
        <a
          href="https://sumcoinwallet.org/"
          className="ecosystem-card"
        >
          <div className="ecosystem-icon">
            <img
              src="/sumcoin-wallet-logo.webp"
              alt=""
            />
          </div>

          <span>SELF-CUSTODY</span>
          <h2>Sumcoin Wallet</h2>
          <p>
            A non-custodial wallet for holding and transferring
            SUM directly.
          </p>

          <strong>Open wallet site →</strong>
        </a>

        <a
          href="https://sumexplorer.com/"
          className="ecosystem-card"
        >
          <div className="ecosystem-symbol">◈</div>

          <span>BLOCKCHAIN DATA</span>
          <h2>Sumcoin Explorer</h2>
          <p>
            Inspect blocks, transactions and activity recorded
            on the Sumcoin blockchain.
          </p>

          <strong>Open explorer →</strong>
        </a>

        <a
          href="https://sumcoin.org/"
          className="ecosystem-card"
        >
          <div className="ecosystem-symbol">Σ</div>

          <span>NETWORK</span>
          <h2>Sumcoin</h2>
          <p>
            Learn about SUM, the network and the broader Sumcoin
            project.
          </p>

          <strong>Visit Sumcoin.org →</strong>
        </a>

        <a
          href="https://sumcoinmarketplace.com/"
          className="ecosystem-card"
        >
          <div className="ecosystem-symbol">◆</div>

          <span>MARKETPLACE</span>
          <h2>Sumcoin Marketplace</h2>
          <p>
            Explore commerce and services connected with the
            Sumcoin ecosystem.
          </p>

          <strong>Open marketplace →</strong>
        </a>
      </div>

      <Section
        label="HOW IT CONNECTS"
        title="Price, ownership and verification are separate layers."
      >
        <p>
          SumcoinPrice provides market context. A wallet provides
          custody and transaction creation. A blockchain explorer
          provides an independent view of confirmed network
          activity.
        </p>

        <p>
          Separating those functions is useful because no single
          website needs to control every part of the experience.
          Market information, self-custody and blockchain
          verification can remain distinct.
        </p>
      </Section>

      <div className="cta-panel">
        <div>
          <span>START WITH THE MARKET</span>
          <h2>See the current SUM reference value.</h2>
        </div>

        <a href="/" className="content-button">
          Live Sumcoin price →
        </a>
      </div>
    </PageShell>
  )
}
