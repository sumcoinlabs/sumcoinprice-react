import './ContentPages.css'

import {
  HistorySnapshot,
  LiveMarketStrip,
  P2PReferenceCard,
} from './MarketTools'

type NavItem = {
  href: string
  label: string
}

const nav: NavItem[] = [
  {
    href: '/',
    label: 'Price',
  },
  {
    href: '/peer-to-peer/',
    label: 'Peer to Peer',
  },
  {
    href: '/buy/',
    label: 'Buy',
  },
  {
    href: '/calculator/',
    label: 'Calculator',
  },
  {
    href: '/sumcoin-vs-bitcoin/',
    label: 'SUM vs BTC',
  },
  {
    href: '/history/',
    label: 'History',
  },
  {
    href: '/index/',
    label: 'Index',
  },
  {
    href: '/ecosystem/',
    label: 'Ecosystem',
  },
]

function PageHeader() {
  return (
    <header className="content-header">
      <a
        href="/"
        className="brand"
      >
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
          <a
            key={item.href}
            href={item.href}
          >
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
        <strong>
          SumcoinPrice
        </strong>

        <span>
          Price, history and practical
          context for the Sumcoin
          ecosystem.
        </span>
      </div>

      <div className="footer-links">
        <a href="/">
          Live Price
        </a>

        <a href="/peer-to-peer/">
          Peer to Peer
        </a>

        <a href="/calculator/">
          Calculator
        </a>

        <a href="https://sumcoinwallet.org/">
          Wallet
        </a>

        <a href="https://sumexplorer.com/">
          Explorer
        </a>
      </div>
    </footer>
  )
}

export function PageShell({
  eyebrow,
  title,
  lead,
  variant,
  children,
}: {
  eyebrow: string
  title: string
  lead: string
  variant:
    | 'about'
    | 'index'
    | 'history'
    | 'ecosystem'
    | 'buy'
    | 'calculator'
    | 'compare'
    | 'peer'
  children: React.ReactNode
}) {
  return (
    <main
      className={
        `page content-page content-page--${variant}`
      }
    >
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="shell">
        <PageHeader />

        <section className="content-hero">
          <div className="content-eyebrow">
            {eyebrow}
          </div>

          <h1>
            {title}
          </h1>

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
        <article
          className="feature-card"
          key={item.title}
        >
          {item.number && (
            <div className="feature-number">
              {item.number}
            </div>
          )}

          <h2>
            {item.title}
          </h2>

          <p>
            {item.text}
          </p>
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
      <div className="section-kicker">
        {label}
      </div>

      <h2 className="section-title">
        {title}
      </h2>

      <div className="section-copy">
        {children}
      </div>
    </section>
  )
}

export function AboutPage() {
  return (
    <PageShell
      variant="about"
      eyebrow="WHY SUMCOIN EXISTS"
      title="A digital currency designed to be used, not merely traded."
      lead="Sumcoin starts with a simple question: if cryptocurrency is supposed to move directly from one person to another, why should an exchange have to sit in the middle of custody, transfer and price discovery?"
    >
      <section className="manifesto-panel">
        <div className="manifesto-mark">
          P2P
        </div>

        <div>
          <span>
            THE SUMCOIN THESIS
          </span>

          <h2>
            Separate the currency
            from the exchange.
          </h2>

          <p>
            A centralized exchange can
            be useful for trading, but
            it does not have to define
            the currency itself.
            Sumcoin combines an
            independent index reference
            rate with a blockchain and
            self-custody wallets so SUM
            can be held and transferred
            without first being
            deposited with an exchange.
          </p>
        </div>
      </section>

      <div className="currency-case-grid">
        <article>
          <span>01</span>

          <h2>
            A reference price before
            a trade happens
          </h2>

          <p>
            The Sumcoin Index is built
            from the broader crypto
            market rather than the last
            trade on one SUM exchange.
            That gives two people a
            common reference value even
            when they are transacting
            directly.
          </p>
        </article>

        <article>
          <span>02</span>

          <h2>
            Your wallet can remain
            your wallet
          </h2>

          <p>
            A self-custody wallet lets
            the user control the keys.
            Moving SUM between two
            wallets does not require
            handing custody to a broker
            or centralized exchange.
          </p>
        </article>

        <article>
          <span>03</span>

          <h2>
            Payment can be the end use
          </h2>

          <p>
            SUM can move directly from
            the payer's wallet to the
            recipient's wallet. The
            objective is not simply to
            speculate on a token, but
            to make the token usable as
            transferable digital value.
          </p>
        </article>

        <article>
          <span>04</span>

          <h2>
            Settlement can be checked
          </h2>

          <p>
            A public block explorer
            provides independent
            verification of addresses,
            transactions, blocks and
            confirmations after a
            payment is broadcast.
          </p>
        </article>
      </div>

      <Section
        label="IS THAT BETTER?"
        title="It depends on what you want a cryptocurrency to do."
      >
        <p>
          If the primary goal is
          exchange liquidity and
          speculative trading, an
          exchange-centered ecosystem
          can be useful. Sumcoin makes
          a different design choice.
          It emphasizes a currency that
          can still be valued, held and
          transferred when the two
          people involved are dealing
          directly with each other.
        </p>

        <p>
          For someone who values
          self-custody, direct payments
          and less dependence on a
          centralized trading venue,
          that can make Sumcoin a
          stronger fit as money.
        </p>

        <blockquote>
          The useful question is not
          only "What can I trade this
          for?" It is also "Can I hold
          it myself, agree on its value
          and pay another person
          directly?"
        </blockquote>
      </Section>

      <div className="cta-panel">
        <div>
          <span>
            SEE THE TRANSACTION PATH
          </span>

          <h2>
            Understand Sumcoin
            peer to peer.
          </h2>
        </div>

        <a
          href="/peer-to-peer/"
          className="content-button"
        >
          How P2P works →
        </a>
      </div>
    </PageShell>
  )
}

export function IndexPage() {
  return (
    <PageShell
      variant="index"
      eyebrow="THE SUMCOIN INDEX"
      title="A market reference built from the market, not one order book."
      lead="According to Sumcoin's published methodology, the SUM reference price follows the top 100 cryptocurrencies by global market capitalization and draws from more than 600 data points in near real time."
    >
      <div className="index-metrics">
        <div>
          <strong>100</strong>
          <span>
            leading crypto assets
          </span>
        </div>

        <div>
          <strong>600+</strong>
          <span>
            market data points
          </span>
        </div>

        <div>
          <strong>1</strong>
          <span>
            SUM reference rate
          </span>
        </div>
      </div>

      <LiveMarketStrip />

      <div className="index-flow">
        <div className="flow-node">
          <span>01</span>

          <strong>
            Observe the broader market
          </strong>

          <p>
            The index tracks the
            leading cryptocurrencies
            by global market
            capitalization.
          </p>
        </div>

        <div className="flow-arrow">
          →
        </div>

        <div className="flow-node featured">
          <span>02</span>

          <strong>
            Apply the SUM index model
          </strong>

          <p>
            The broader market inputs
            are aggregated into the
            Sumcoin Index reference
            value.
          </p>
        </div>

        <div className="flow-arrow">
          →
        </div>

        <div className="flow-node">
          <span>03</span>

          <strong>
            Publish one reference rate
          </strong>

          <p>
            Wallets, counterparties and
            market tools can use the
            resulting SUM rate as a
            common reference point.
          </p>
        </div>
      </div>

      <Section
        label="WHY THIS MATTERS"
        title="Peer-to-peer money still needs a way for two people to discuss value."
      >
        <p>
          A wallet can transfer coins
          without an exchange, but two
          people still need a way to
          decide what those coins are
          worth. Sumcoin's answer is to
          separate that reference-price
          function from any single SUM
          trading venue.
        </p>

        <p>
          This does not mean every
          counterparty must transact at
          exactly the index rate.
          People can still negotiate.
          The index supplies a common
          starting point that does not
          require both parties to use
          the same centralized
          exchange.
        </p>
      </Section>

      <div className="index-question">
        <span>
          PRACTICAL EXAMPLE
        </span>

        <h2>
          If two people agree that an
          item is worth $500, the index
          provides a reference for how
          much SUM represents that
          value.
        </h2>

        <a href="/calculator/">
          Open the live SUM calculator →
        </a>
      </div>
    </PageShell>
  )
}

export function HistoryPage() {
  return (
    <PageShell
      variant="history"
      eyebrow="SUM THROUGH TIME"
      title="A price means more when you can see the path that produced it."
      lead="The Sumcoin Index changes with the broader cryptocurrency market. Historical data lets the current rate be viewed as part of a market cycle rather than as an isolated number."
    >
      <HistorySnapshot />

      <div className="history-lenses">
        <article>
          <span>
            RECENT
          </span>

          <h2>
            What changed this year?
          </h2>

          <p>
            One-year data emphasizes
            the current market cycle,
            recent highs and lows, and
            whether SUM has gained or
            lost value over the period.
          </p>
        </article>

        <article>
          <span>
            LONG RANGE
          </span>

          <h2>
            What does the full record
            look like?
          </h2>

          <p>
            The all-time series makes
            it possible to distinguish
            a temporary local high from
            the actual historical
            extremes recorded by the
            index.
          </p>
        </article>

        <article>
          <span>
            RELATIVE
          </span>

          <h2>
            What happened versus
            Bitcoin?
          </h2>

          <p>
            SUM/BTC history removes the
            dollar from the comparison
            and shows how the Sumcoin
            reference value changed in
            Bitcoin terms.
          </p>
        </article>
      </div>

      <Section
        label="COMPARATIVE VALUE"
        title="Different nominal prices become easier to understand when every asset starts at 100."
      >
        <p>
          The main dashboard normalizes
          SUM, Bitcoin, gold, silver
          and U.S. dollar purchasing
          power to the same starting
          value. A move from 100 to 150
          means a 50% increase
          regardless of the asset's
          original dollar price.
        </p>

        <p>
          That is useful because a high
          nominal coin price does not
          by itself tell you whether an
          asset performed well. What
          matters is the percentage
          change over the same period.
        </p>
      </Section>

      <div className="cta-panel">
        <div>
          <span>
            INTERACTIVE DATA
          </span>

          <h2>
            Inspect the complete SUM
            chart.
          </h2>
        </div>

        <a
          href="/"
          className="content-button"
        >
          Open dashboard →
        </a>
      </div>
    </PageShell>
  )
}

export function EcosystemPage() {
  return (
    <PageShell
      variant="ecosystem"
      eyebrow="THE SUMCOIN LOOP"
      title="Price it. Hold it. Pay with it. Verify it."
      lead="A usable peer-to-peer currency needs more than a price chart. Sumcoin's ecosystem separates reference pricing, custody, transfer, discovery and blockchain verification into distinct tools."
    >
      <div className="ecosystem-loop">
        <div>
          <span>01</span>
          <strong>PRICE</strong>
          <p>
            SumcoinPrice and the
            Sumcoin Index provide a
            reference value.
          </p>
        </div>

        <div>
          <span>02</span>
          <strong>HOLD</strong>
          <p>
            Sumcoin Wallet provides
            self-custody and wallet
            addresses.
          </p>
        </div>

        <div>
          <span>03</span>
          <strong>USE</strong>
          <p>
            People can transact
            directly or discover peers
            through the marketplace.
          </p>
        </div>

        <div>
          <span>04</span>
          <strong>VERIFY</strong>
          <p>
            SumExplorer provides an
            independent view of
            on-chain settlement.
          </p>
        </div>
      </div>

      <div className="ecosystem-grid">
        <a
          href="https://sumcoinwallet.org/"
          className="ecosystem-card"
        >
          <div className="ecosystem-icon">
            <img
              src="/sumcoin-wallet-logo.webp"
              alt="Sumcoin Wallet"
            />
          </div>

          <span>SELF-CUSTODY</span>

          <h2>
            Sumcoin Wallet
          </h2>

          <p>
            The official wallet
            describes itself as
            self-custody and gives the
            user control of the wallet
            recovery phrase and keys.
            It can send and receive SUM
            directly between wallet
            addresses.
          </p>

          <strong>
            Open wallet site →
          </strong>
        </a>

        <a
          href="https://sumexplorer.com/"
          className="ecosystem-card"
        >
          <div className="ecosystem-symbol">
            ◎
          </div>

          <span>
            PUBLIC VERIFICATION
          </span>

          <h2>
            SumExplorer
          </h2>

          <p>
            Search transactions,
            addresses, blocks and
            confirmations to verify
            what the blockchain
            actually recorded.
          </p>

          <strong>
            Open explorer →
          </strong>
        </a>

        <a
          href="https://sumcoinmarketplace.com/"
          className="ecosystem-card"
        >
          <div className="ecosystem-symbol">
            ↔
          </div>

          <span>
            P2P DISCOVERY
          </span>

          <h2>
            Sumcoin Marketplace
          </h2>

          <p>
            Buyers and sellers can
            discover one another,
            negotiate directly and use
            SUM as payment rather than
            treating the currency only
            as something to trade on an
            exchange.
          </p>

          <strong>
            Explore marketplace →
          </strong>
        </a>

        <a
          href="https://sumcoin.org/"
          className="ecosystem-card"
        >
          <div className="ecosystem-symbol">
            Σ
          </div>

          <span>
            NETWORK + DOCUMENTATION
          </span>

          <h2>
            Sumcoin.org
          </h2>

          <p>
            The official project site
            links the network, wallet,
            index methodology, exchange
            resources and other Sumcoin
            documentation.
          </p>

          <strong>
            Visit Sumcoin.org →
          </strong>
        </a>
      </div>

      <Section
        label="NO SINGLE TOOL DOES EVERYTHING"
        title="That separation is part of the point."
      >
        <p>
          SumcoinPrice does not hold
          your SUM. The wallet does not
          decide whether a blockchain
          transaction exists. The
          explorer does not need to
          custody your money. The
          marketplace can help people
          find one another without
          becoming the blockchain
          itself.
        </p>

        <p>
          Separating those roles makes
          it easier to understand where
          trust is required and where
          independent verification is
          possible.
        </p>
      </Section>
    </PageShell>
  )
}

export function PeerToPeerPage() {
  return (
    <PageShell
      variant="peer"
      eyebrow="PEER-TO-PEER SUMCOIN"
      title="Peer to peer is not a slogan. It is the transaction path."
      lead="Two people can agree on value, exchange a wallet address, send SUM directly and verify the settlement on the public blockchain. An exchange does not have to custody the payment in the middle."
    >
      <P2PReferenceCard />

      <section className="p2p-steps">
        <article>
          <span>01</span>

          <div>
            <h2>
              Agree on value
            </h2>

            <p>
              Buyer and seller agree
              on the terms of the
              transaction. The Sumcoin
              Index can provide a
              common SUM/USD reference
              rate while the parties
              remain free to negotiate.
            </p>
          </div>
        </article>

        <article>
          <span>02</span>

          <div>
            <h2>
              Share the receiving
              address
            </h2>

            <p>
              The recipient provides a
              SUM wallet address or QR
              code. The sender should
              verify the address before
              approving the transfer.
            </p>
          </div>
        </article>

        <article>
          <span>03</span>

          <div>
            <h2>
              Send wallet to wallet
            </h2>

            <p>
              The sender authorizes the
              transaction from their
              own wallet. SUM moves
              through the Sumcoin
              network rather than
              through an exchange
              account.
            </p>
          </div>
        </article>

        <article>
          <span>04</span>

          <div>
            <h2>
              Let the network settle
              it
            </h2>

            <p>
              The transaction is
              broadcast to the network
              and recorded on the
              blockchain as it receives
              confirmation.
            </p>
          </div>
        </article>

        <article>
          <span>05</span>

          <div>
            <h2>
              Verify independently
            </h2>

            <p>
              Either party can use
              SumExplorer to check the
              transaction ID, address,
              block and confirmations
              instead of relying only
              on a screenshot or claim
              from the other person.
            </p>
          </div>
        </article>
      </section>

      <div className="peer-case-grid">
        <article>
          <span>
            WHAT DISAPPEARS
          </span>

          <h2>
            Exchange custody is not
            required for the transfer.
          </h2>

          <p>
            The sender does not have to
            deposit SUM with a
            centralized exchange just
            to pay another SUM wallet.
          </p>
        </article>

        <article>
          <span>
            WHAT REMAINS
          </span>

          <h2>
            Personal responsibility
            still matters.
          </h2>

          <p>
            Blockchain payments can be
            irreversible. Users still
            need to verify addresses,
            understand counterparties,
            agree on terms and follow
            applicable laws.
          </p>
        </article>
      </div>

      <Section
        label="WHY SUMCOIN MAKES A CURRENCY CASE"
        title="A currency becomes more useful when its value and its transfer do not depend on the same intermediary."
      >
        <p>
          Sumcoin's design separates
          reference pricing from
          settlement. The index supplies
          a market reference. The wallet
          controls the payment. The
          blockchain records the
          settlement. The explorer lets
          people check the result.
        </p>

        <p>
          That does not make every P2P
          transaction risk-free and it
          does not remove the need for
          adoption. It does, however,
          create a coherent path for
          using SUM as money between
          peers rather than requiring
          every use of SUM to begin and
          end on an exchange.
        </p>
      </Section>

      <div className="cta-panel">
        <div>
          <span>
            USE THE ECOSYSTEM
          </span>

          <h2>
            Wallet, marketplace and
            explorer.
          </h2>
        </div>

        <a
          href="/ecosystem/"
          className="content-button"
        >
          Explore the tools →
        </a>
      </div>
    </PageShell>
  )
}
