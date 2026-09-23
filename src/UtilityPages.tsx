import {
  FeatureGrid,
  PageShell,
  Section,
} from './ContentPages'

import {
  LiveMarketStrip,
  SumBtcSnapshot,
  SumCalculator,
} from './MarketTools'

export function BuyPage() {
  return (
    <PageShell
      eyebrow="GET SUMCOIN"
      title="How to get, hold and use Sumcoin."
      lead="Start with the current SUM Index rate, choose an acquisition method you understand, and move SUM to a self-custody wallet when appropriate."
    >
      <LiveMarketStrip />

      <div className="buy-paths">
        <article className="buy-path">
          <span>01</span>

          <h2>
            Get a SUM wallet
          </h2>

          <p>
            A self-custody wallet gives
            you a Sumcoin address for
            receiving and holding SUM
            without leaving the currency
            with a third party.
          </p>

          <a
            href="https://sumcoinwallet.org/"
          >
            Sumcoin Wallet →
          </a>
        </article>

        <article className="buy-path">
          <span>02</span>

          <h2>
            Check acquisition options
          </h2>

          <p>
            Availability changes by
            region and provider. Use the
            official Sumcoin acquisition
            resources to review current
            exchange, swap or kiosk
            options.
          </p>

          <a
            href="https://www.sumcoin.org/exchange/"
          >
            Official buy resources →
          </a>
        </article>

        <article className="buy-path">
          <span>03</span>

          <h2>
            Check the index rate
          </h2>

          <p>
            Compare any quoted price with
            the current SUM Index
            reference rate before
            completing a transaction.
          </p>

          <a href="/">
            Live SUM price →
          </a>
        </article>
      </div>

      <Section
        label="BEFORE YOU TRANSACT"
        title="Know the difference between a reference price and a trading quote."
      >
        <p>
          SumcoinPrice publishes the
          current SUM Index reference
          value. A third-party provider
          may quote a different effective
          price because of liquidity,
          spread, fees or payment method.
        </p>

        <p>
          Verify the provider, understand
          its fees and confirm the wallet
          address before sending funds.
          Blockchain transactions can be
          irreversible.
        </p>
      </Section>

      <div className="cta-panel">
        <div>
          <span>SELF CUSTODY</span>
          <h2>
            Store SUM in your own wallet.
          </h2>
        </div>

        <a
          href="https://sumcoinwallet.org/"
          className="content-button"
        >
          Get Sumcoin Wallet →
        </a>
      </div>
    </PageShell>
  )
}

export function CalculatorPage() {
  return (
    <PageShell
      eyebrow="SUM CALCULATOR"
      title="Convert Sumcoin to U.S. dollars at the live index rate."
      lead="Enter any amount of SUM to calculate its current USD reference value using the live Sumcoin Index price."
    >
      <SumCalculator />

      <LiveMarketStrip />

      <FeatureGrid
        items={[
          {
            number: 'SUM',
            title:
              'Live reference rate',
            text:
              'The calculator uses the same current SUM/USD reference rate displayed by the SumcoinPrice market dashboard.',
          },
          {
            number: 'USD',
            title:
              'Instant conversion',
            text:
              'Change the SUM amount and the estimated U.S. dollar value updates using the current index rate.',
          },
          {
            number: 'LIVE',
            title:
              'Market context',
            text:
              'Price is shown alongside market capitalization, volume and supply so the conversion is not viewed in isolation.',
          },
        ]}
      />

      <Section
        label="REFERENCE VALUE"
        title="A calculator is not a trade quote."
      >
        <p>
          The result represents the
          Sumcoin Index reference value.
          The amount offered by a
          particular exchange, swap,
          kiosk or private counterparty
          can differ because of fees,
          spread and liquidity.
        </p>
      </Section>
    </PageShell>
  )
}

export function ComparePage() {
  return (
    <PageShell
      eyebrow="SUMCOIN VS BITCOIN"
      title="Two cryptocurrencies. Two different approaches to price."
      lead="Compare SUM with Bitcoin using the live SUM/BTC ratio, historical market data and the different mechanisms used to express value."
    >
      <SumBtcSnapshot />

      <LiveMarketStrip />

      <div className="compare-grid">
        <article className="compare-card">
          <strong>SUMCOIN</strong>

          <h2>
            Index-derived reference value
          </h2>

          <p>
            Sumcoin describes its
            reference price as an index
            derived from the broader
            cryptocurrency market,
            including the leading assets
            by market capitalization.
          </p>
        </article>

        <article className="compare-card">
          <strong>BITCOIN</strong>

          <h2>
            Market-traded price
          </h2>

          <p>
            Bitcoin prices are formed
            through trading activity
            across exchanges and other
            markets, with quotes varying
            slightly among venues.
          </p>
        </article>

        <article className="compare-card">
          <strong>SUM / BTC</strong>

          <h2>
            Relative purchasing value
          </h2>

          <p>
            Expressing one SUM in BTC
            makes it possible to examine
            Sumcoin performance without
            using the U.S. dollar as the
            common denominator.
          </p>
        </article>
      </div>

      <Section
        label="COMPARE PERFORMANCE"
        title="Nominal price alone does not tell the whole story."
      >
        <p>
          SumcoinPrice stores historical
          SUM/USD and SUM/BTC observations
          and also provides normalized
          performance views. That lets
          different assets begin from the
          same starting value and makes
          percentage performance easier
          to compare.
        </p>
      </Section>

      <div className="cta-panel">
        <div>
          <span>INTERACTIVE CHART</span>

          <h2>
            Switch the dashboard to
            SUM / BTC.
          </h2>
        </div>

        <a
          href="/"
          className="content-button"
        >
          Compare on dashboard →
        </a>
      </div>
    </PageShell>
  )
}
