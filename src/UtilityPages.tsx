import {
  PageShell,
  Section,
} from './ContentPages'

import {
  CompareStats,
  LiveMarketStrip,
  RateExamples,
  SumBtcSnapshot,
  SumCalculator,
} from './MarketTools'

export function BuyPage() {
  return (
    <PageShell
      variant="buy"
      eyebrow="GET AND USE SUM"
      title="There is more than one path to Sumcoin."
      lead="A peer-to-peer currency does not need one mandatory exchange. Start with a wallet, understand the current index rate, choose an acquisition path you trust and keep control of where your SUM ultimately lives."
    >
      <LiveMarketStrip />

      <section className="buy-rail">
        <article>
          <span>01</span>

          <div>
            <h2>
              Start with a wallet
            </h2>

            <p>
              Create a SUM address in
              the self-custody Sumcoin
              Wallet before deciding
              how you want to acquire
              coins.
            </p>
          </div>

          <a href="https://sumcoinwallet.org/">
            Get the wallet →
          </a>
        </article>

        <article>
          <span>02</span>

          <div>
            <h2>
              Know the reference rate
            </h2>

            <p>
              Check the live Sumcoin
              Index so you have a
              reference point before
              evaluating a quote or
              negotiating directly with
              another person.
            </p>
          </div>

          <a href="/calculator/">
            Convert SUM ↔ USD →
          </a>
        </article>

        <article>
          <span>03</span>

          <div>
            <h2>
              Review current Sumcoin
              resources
            </h2>

            <p>
              Sumcoin's current official
              resources emphasize
              wallet migration,
              peer-to-peer use and the
              Sumcoin Marketplace.
              Availability of any
              third-party buying method
              can change over time.
            </p>
          </div>

          <a href="https://www.sumcoin.org/migrations/">
            Current official resources →
          </a>
        </article>

        <article>
          <span>04</span>

          <div>
            <h2>
              Verify where it arrived
            </h2>

            <p>
              After a transfer, use
              your wallet and
              SumExplorer to verify the
              transaction and its
              confirmations.
            </p>
          </div>

          <a href="https://sumexplorer.com/">
            Open explorer →
          </a>
        </article>
      </section>

      <div className="buy-options">
        <article className="buy-option p2p-option">
          <span>
            PEER TO PEER
          </span>

          <h2>
            Buy, sell or trade directly
            with another person.
          </h2>

          <p>
            The marketplace exists to
            help peers discover one
            another. The parties can
            negotiate terms themselves
            and transfer SUM directly
            between wallets.
          </p>

          <a href="https://sumcoinmarketplace.com/">
            Explore Sumcoin Marketplace →
          </a>
        </article>

        <article className="buy-option">
          <span>
            CURRENT SUMCOIN RESOURCES
          </span>

          <h2>
            Use the paths that are
            actually available today.
          </h2>

          <p>
            Sumcoin's current official
            page focuses on migration,
            wallet setup and peer-to-peer
            use. If an exchange, DEX,
            kiosk or other third-party
            option is available, verify
            the provider, current fees
            and withdrawal support
            directly before using it.
          </p>

          <a href="https://www.sumcoin.org/migrations/">
            Review current Sumcoin resources →
          </a>
        </article>
      </div>

      <Section
        label="ACQUISITION IS NOT CUSTODY"
        title="Getting SUM and holding SUM are two different decisions."
      >
        <p>
          A service used to acquire a
          cryptocurrency does not have
          to remain its permanent
          custodian. Once a user has
          SUM in a compatible
          self-custody wallet, later
          wallet-to-wallet payments can
          take place without returning
          the coins to the original
          acquisition service.
        </p>
      </Section>
    </PageShell>
  )
}

export function CalculatorPage() {
  return (
    <PageShell
      variant="calculator"
      eyebrow="LIVE SUM CONVERTER"
      title="Put the Sumcoin Index into numbers you can use."
      lead="Convert in either direction. Enter SUM to estimate its current U.S. dollar reference value, or enter dollars to see the equivalent amount of SUM at the live index rate."
    >
      <SumCalculator />

      <RateExamples />

      <Section
        label="REFERENCE RATE ≠ GUARANTEED QUOTE"
        title="The index gives you a benchmark. The transaction still belongs to the parties."
      >
        <p>
          The calculator uses the
          Sumcoin Index reference rate.
          A peer-to-peer counterparty,
          kiosk, DEX or other provider
          may use a different effective
          price because of fees, spread,
          liquidity or negotiated terms.
        </p>

        <p>
          That distinction is useful:
          the index can provide a common
          starting point without
          requiring the index itself to
          become the custodian or
          counterparty to the payment.
        </p>
      </Section>

      <div className="calculator-next">
        <div>
          <span>
            NEXT STEP
          </span>

          <h2>
            See how the reference rate
            fits into a direct P2P
            payment.
          </h2>
        </div>

        <a href="/peer-to-peer/">
          Follow a peer-to-peer payment →
        </a>
      </div>
    </PageShell>
  )
}

export function ComparePage() {
  return (
    <PageShell
      variant="compare"
      eyebrow="SUMCOIN / BITCOIN"
      title="The important difference is not whether either network can transfer value peer to peer."
      lead="Bitcoin and Sumcoin both use blockchain networks. The distinction Sumcoin emphasizes is how a reference price is formed: Bitcoin is market-priced across trading venues, while SUM uses an index derived from the broader cryptocurrency market."
    >
      <SumBtcSnapshot />

      <CompareStats />

      <div className="compare-split">
        <article className="compare-sum">
          <span>SUMCOIN</span>

          <h2>
            Index reference pricing
          </h2>

          <p>
            Sumcoin's published
            methodology derives the SUM
            reference value from the
            leading cryptocurrencies by
            global market
            capitalization.
          </p>

          <p>
            The design goal is to avoid
            making one SUM exchange's
            latest trade the sole
            reference for the currency.
          </p>
        </article>

        <article className="compare-btc">
          <span>BITCOIN</span>

          <h2>
            Market-traded pricing
          </h2>

          <p>
            Bitcoin's observed dollar
            price is formed through
            trading across exchanges
            and markets. Quotes can vary
            slightly among venues.
          </p>

          <p>
            Bitcoin itself can still be
            transferred directly
            between wallets; exchange
            pricing and blockchain
            transfer are separate
            concepts.
          </p>
        </article>
      </div>

      <Section
        label="WHAT SUMCOIN CHANGES"
        title="Sumcoin adds an index reference to the peer-to-peer model."
      >
        <p>
          Sumcoin's argument is that
          direct digital money benefits
          from a reference price that
          can exist independently of a
          single trading venue. That is
          particularly relevant when
          two people want to negotiate
          a transaction directly rather
          than first meeting inside an
          exchange order book.
        </p>

        <p>
          The SUM/BTC pair on this page
          provides another way to view
          that relationship by
          expressing one SUM directly in
          Bitcoin terms.
        </p>
      </Section>

      <div className="cta-panel">
        <div>
          <span>
            FULL COMPARISON DATA
          </span>

          <h2>
            Inspect SUM against Bitcoin
            over time.
          </h2>
        </div>

        <a
          href="/"
          className="content-button"
        >
          Open performance chart →
        </a>
      </div>
    </PageShell>
  )
}
