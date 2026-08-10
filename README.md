<div align="center">

<img src="https://www.sumcoin.org/wp-content/uploads/2019/07/sumcoin_400x400.png" width="120" alt="Sumcoin Logo">

# SumcoinPrice

### Real-time and historical market intelligence for the Sumcoin Index

[![Live](https://img.shields.io/badge/LIVE-sumcoinprice.com-22c55e?style=for-the-badge)](https://sumcoinprice.com/app/)
[![Sumcoin](https://img.shields.io/badge/SUM-Sumcoin_Index-4285F4?style=for-the-badge)](https://sumcoin.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Powered-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![TradingView](https://img.shields.io/badge/Charts-Lightweight_Charts-2962FF?style=for-the-badge)](https://tradingview.github.io/lightweight-charts/)

**Price · History · Purchasing Power · Context**

[Live Price](https://sumcoinprice.com/app/) ·
[Sumcoin](https://sumcoin.org/) ·
[Wallet](https://sumcoinwallet.org/) ·
[Explorer](https://sumexplorer.com/) ·
[Marketplace](https://sumcoinmarketplace.com/)

</div>

---

## What is SumcoinPrice?

**SumcoinPrice is the market-data interface for the Sumcoin Index.**

It provides a modern, interactive view of SUM pricing, historical performance, technical indicators, relative asset performance, purchasing-power analysis, and the broader Sumcoin ecosystem.

The project is built around a simple question:

> **How has Sumcoin actually performed over time, and what does that performance mean in the real world?**

Most cryptocurrency price sites stop at the current quote.

SumcoinPrice goes further.

It combines years of Sumcoin historical data with interactive charting and normalized comparisons against Bitcoin, gold, silver, and U.S. dollar purchasing power.

---

# Why Sumcoin?

Bitcoin introduced a powerful idea: electronic cash that could move directly from one person to another without requiring a financial institution in the middle.

Sumcoin starts from that same peer-to-peer premise.

The Sumcoin thesis is that cryptocurrency gradually moved away from that original model as centralized exchanges became the primary places where digital assets were bought, sold, held, and valued.

Sumcoin takes a different approach.

### Indexed value

SUM uses the **Sumcoin Index** as a reference value rather than requiring a centralized exchange to be the sole source of price discovery.

### Self-custody

Users can hold SUM directly in their own wallets rather than requiring an exchange account to possess or transfer the currency.

### Direct transfer

SUM can move directly from one Sumcoin wallet to another over the blockchain.

No exchange account is required for the network itself to function.

> **The exchange does not have to be the product. The currency is the product.**

---

# Features

## Interactive SUM market chart

SumcoinPrice includes a purpose-built market interface powered by TradingView's open-source **Lightweight Charts** library.

Current functionality includes:

- SUM / USD pricing
- SUM / BTC pricing
- Candlestick charts
- Line charts
- Multiple historical timeframes
- Historical OHLC data
- Crosshair price inspection
- Period statistics
- Fit-to-data controls
- Intraday market history
- Multi-year market history
- RSI
- MACD
- Trend tools
- True all-time-high reference
- Responsive desktop layout
- Responsive mobile layout

The all-time-high marker represents the actual SUM all-time high.

If the true ATH does not exist inside the currently selected chart period, the marker is not shown.

This prevents a local period high from being mistaken for the historical ATH.

---

# Relative Performance

Different assets have radically different nominal prices.

A Bitcoin may cost tens of thousands of dollars while an ounce of gold, an ounce of silver, SUM, and the purchasing power of a dollar all use completely different scales.

Comparing those raw prices directly is not useful.

SumcoinPrice solves this by normalizing every asset to the same starting value:

**100**

From there, performance becomes directly comparable.

If an asset moves from 100 to 150, it gained **50%**.

If it moves from 100 to 75, it lost **25%**.

### Assets currently compared

| Asset | Historical Data Source |
|---|---|
| **SUM** | Sumcoin Index |
| **Bitcoin** | Coinbase |
| **Gold** | World Bank Commodity Markets |
| **Silver** | World Bank Commodity Markets |
| **Dollar Purchasing Power** | U.S. CPI / FRED |

### Comparison periods

- 1 Year
- 3 Years
- 5 Years
- 10 Years
- All Time

Every series begins at the same baseline, allowing performance to be understood at a glance.

---

# Dollar Purchasing Power

The dollar line on SumcoinPrice does **not** represent the U.S. Dollar Index, DXY, or a foreign-exchange pair.

It represents something more relevant to everyday use:

**what a dollar can actually buy.**

The calculation uses U.S. Consumer Price Index data.

This lets the interface show inflation from two complementary perspectives.

### Consumer prices

How much more money is required to purchase approximately the same general basket of consumer goods.

### Dollar purchasing power

How much purchasing ability a dollar retained or lost over the same period.

These percentages are mathematically related but are not identical.

For example, if the CPI increases from roughly 253 to 333:

- Consumer prices increased by roughly **31%**
- Dollar purchasing power declined by roughly **24%**
- Something costing approximately **$100** at the beginning of the period would require roughly **$131** at the end

Another way to understand the same change:

> A person's income would have needed to increase by roughly the cumulative rise in consumer prices simply to maintain approximately the same consumer purchasing power.

SumcoinPrice calculates these values dynamically for the selected comparison period.

---

# Real Historical Data

The comparison system is built from real historical datasets.

It does not use fabricated or illustrative performance points.

### SUM

Historical SUM / USD pricing comes from the Sumcoin Index historical database.

### Bitcoin

Bitcoin market history comes from Coinbase BTC / USD market data.

### Gold

Historical gold pricing is sourced from World Bank Commodity Markets data.

### Silver

Historical silver pricing is sourced from World Bank Commodity Markets data.

### U.S. Dollar Purchasing Power

Dollar purchasing power is derived from the U.S. Consumer Price Index using FRED CPI data.

---

# Data Integrity

Historical financial charts are only useful when the underlying data is treated carefully.

The SumcoinPrice data pipeline follows several basic principles:

- Historical gaps are not silently invented
- Raw Sumcoin historical data is preserved
- Derived datasets should be identifiable as derived
- External sources are identified
- Cross-asset comparisons use a common normalized baseline
- Traditional asset comparisons use compatible monthly observations
- Historical source data should not be rewritten merely to make a chart look cleaner

The goal is to make the chart understandable without pretending the underlying datasets are something they are not.

---

# Architecture

The comparison pipeline can be summarized as:

    Sumcoin Index history
            |
            |
            v
    +-------------------+
    |                   |
    |  Comparison API   |
    |                   |
    +-------------------+
       ^      ^      ^
       |      |      |
    Bitcoin  Metals   CPI
    Coinbase World    FRED
             Bank
       |      |      |
       +------+------+
              |
              v
       Normalize to 100
              |
              v
       SumcoinPrice UI

The React frontend consumes processed JSON data rather than embedding external financial data directly into the browser application.

---

# The Sumcoin Ecosystem

SumcoinPrice is one component of a broader peer-to-peer ecosystem.

## Sumcoin Wallet

**Self-custody SUM.**

The Sumcoin Wallet is the primary way to hold and use SUM without handing custody to a centralized exchange.

A user can:

- create a Sumcoin wallet
- control the recovery phrase
- receive SUM
- hold SUM directly
- view the indexed reference value
- send SUM directly to another Sumcoin address

**Wallet:** https://sumcoinwallet.org/

---

## SumExplorer

**Verify the blockchain yourself.**

SumExplorer provides a public view into the Sumcoin blockchain.

It can be used to inspect:

- transactions
- addresses
- blocks
- confirmations
- network activity

Instead of relying solely on what a wallet or website reports, blockchain activity can be independently inspected.

**Explorer:** https://sumexplorer.com/

---

## Sumcoin Marketplace

**Peer-to-peer commerce built around direct transactions.**

The Sumcoin Marketplace provides a place where buyers and sellers can discover one another and negotiate transactions directly.

SUM can then function as the currency exchanged between the participants without requiring a centralized cryptocurrency exchange to act as the transaction venue.

**Marketplace:** https://sumcoinmarketplace.com/

---

# Technology

The SumcoinPrice frontend intentionally uses a relatively small modern stack.

| Technology | Purpose |
|---|---|
| **React** | User interface |
| **TypeScript** | Typed frontend development |
| **Vite** | Development and production build system |
| **Lightweight Charts** | Financial chart rendering |
| **CSS** | Custom responsive interface |
| **REST / JSON** | Historical market-data delivery |

The primary charting engine is TradingView's open-source **Lightweight Charts** library.

SumcoinPrice does not depend on the proprietary TradingView Charting Library.

---

# Repository Structure

    sumcoinprice-react/
    |
    +-- public/
    |   |
    |   +-- sumcoin-logo.png
    |
    +-- src/
    |   |
    |   +-- App.tsx
    |   +-- App.css
    |   +-- ComparisonChart.tsx
    |   +-- main.tsx
    |
    +-- index.html
    +-- package.json
    +-- package-lock.json
    +-- tsconfig.json
    +-- vite.config.ts
    +-- README.md

This repository contains the **SumcoinPrice frontend application**.

Production APIs, databases, server credentials, and server-side data aggregation are intentionally maintained separately from this frontend repository.

---

# Development

Clone the repository:

    git clone https://github.com/sumcoinlabs/sumcoinprice-react.git
    cd sumcoinprice-react

Install dependencies:

    npm install

Start the development server:

    npm run dev

Build the production application:

    npm run build

Vite generates the production application inside:

    dist/

---

# Production

The live application is available at:

**https://sumcoinprice.com/app/**

The frontend is built using:

    npm run build

The generated production files are then deployed from the Vite `dist` directory to the production web root.

---

# Security

This repository contains the browser-facing frontend.

It should **not** contain:

- SQL passwords
- SQL usernames intended to remain private
- database connection strings
- private API credentials
- private keys
- authentication tokens
- production `.env` files
- server-side secrets

Sensitive backend configuration belongs outside the public frontend repository.

The included `.gitignore` is intended to prevent common secret-containing files from being accidentally committed.

---

# Market-Data Philosophy

SumcoinPrice distinguishes between three concepts that are frequently treated as though they are the same thing.

### Price

What an asset is worth at a particular moment.

### Reference value

The measure used to express that value.

### Market access

Where and how someone chooses to acquire, hold, sell, or transfer an asset.

Those concepts do not inherently have to originate from the same centralized intermediary.

That distinction is important to the Sumcoin model.

---

# Resources

| Resource | Link |
|---|---|
| **Sumcoin** | https://sumcoin.org/ |
| **SumcoinPrice** | https://sumcoinprice.com/app/ |
| **Sumcoin Wallet** | https://sumcoinwallet.org/ |
| **SumExplorer** | https://sumexplorer.com/ |
| **Sumcoin Marketplace** | https://sumcoinmarketplace.com/ |
| **White Paper** | https://www.sumcoinindex.com/white-paper.html |
| **Sumcoin Wiki** | https://cryptocurrency.fandom.com/wiki/Sumcoin |
| **Sumcoin Labs** | https://github.com/sumcoinlabs |

---

# Contributing

Pull requests and technical contributions are welcome.

Useful contributions include:

- bug fixes
- chart improvements
- responsive UI improvements
- accessibility improvements
- performance improvements
- data-integrity improvements
- additional transparent market-data sources
- documentation improvements

For market-data changes, contributors should preserve the project's core data principles:

1. Do not fabricate missing historical data.
2. Clearly identify derived data.
3. Preserve source attribution.
4. Keep normalized comparisons mathematically transparent.
5. Do not silently rewrite historical source data.

---

# About Sumcoin

Sumcoin is designed around indexed value, self-custody, and direct peer-to-peer transfer.

The objective is not to require a centralized exchange to give the currency meaning or utility.

The network, index, wallets, blockchain, merchants, buyers, sellers, and users can operate independently of a centralized exchange.

<div align="center">

---

## Peer to peer was the point.

### SUMCOIN

[Website](https://sumcoin.org/) ·
[Price](https://sumcoinprice.com/app/) ·
[Wallet](https://sumcoinwallet.org/) ·
[Explorer](https://sumexplorer.com/) ·
[Marketplace](https://sumcoinmarketplace.com/)

</div>
