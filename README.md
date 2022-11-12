# Demo

**[https://tgikf.github.io/crypto-prices/](https://tgikf.github.io/crypto-prices/)**

# Crypto Prices

This repository hosts a small client-side web app, that serves as a prototype for a real-time Cryptocurrency price/order data aggregation app. Order book data is currently aggregated from:

- [Binance](https://www.binance.com/en/markets)
- [Bitmex](https://www.bitmex.com/spot/XBT_USDT)
- [Coinbase](https://coinmarketcap.com/exchanges/coinbase-exchange/)
- [CoinFLEX](https://coinflex.com/markets)

## Tech Stack and Tools

The prototype is based on [Solid.js](https://www.solidjs.com/) written in TypeScript. While Solid's new to me and less adopted than for instance React, I chose it because of its [`solid` performance in benchmarks with other libraries and frameworks](https://krausest.github.io/js-framework-benchmark/2022/table_chrome_107.0.5304.62.html). In addition to that, [Vite](https://vitejs.dev/) is used as dev server and build tool.

## Focus Areas

### Connectivity to Market Data providers

A data aggregator is only as good as the data it's able to aggregate and combine into a single view. Supporting multiple data providers and crucially the ability to add new ones at easy is therefore crucial.

This problem is addressed by a typical inheritance based implementation pattern: A base class [`GenericSocketHandler`](./src/sockethandlers/GenericSocketHandler.ts) implements general logic, for instance the interval-based data publishing feature, and declares abstract methods to be implemented by the provider specific [`SocketHandler` classes](./src/sockethandlers/). This enables easy data provider specific customization such as:

- Custom socket subscriptions (e.g., to the orderbook10 stream on Bitmex but the @bookTicker stream on Binance)
- Exchange specific trading symbol mapping (e.g., `XBTEUR` on Bitmex but `BTCEUR` on Binance)

### Performance optimization to deal with real-time data

Given the nature of the app, it has to potentially display a user n trading paris with constant order updates coming in from m providers. To not overwhelm the browser, isolating the main thread from any data retrieval and evaluation logic was key. At the same time spawning too many `Workers` (i.e., Threads) will take its toll on the system too.

After some experimentation with different models, the following approach was picked:

- A single Shared Worker that establishes connectivity with all websockets
- A single Dedicated Worker that communicates with the SharedWorker to subscribe to data events and decides when to update the UI

A possible way to optimize the app in case of heavy load (i.e., many subscriptions to trading pairs), could be to (cautiously) spread the trading pairs across multiple Dedicated Workers. Given that the websockets run on a Shared Worker that can communicate with multiple Dedicated Workers, no major redesign effort would be required.

### Throttling and Data Conflation

With connectivity to large exchanges such as Binance, subscribing to a popular trading pair will lead to the app receiving messages every few milliseconds even when just subscribing to a single stream of a single exchange. Rendering all updates, as relevant as they may be, in real time will not only be of no use to the user but also have a negative impact on performance.

This problem is addressed by throttling WebSocket price updates in the [`GenericSocketHandler`](./src/sockethandlers/GenericSocketHandler.ts). Updates will happen at most every `150 milliseconds`, which to the user is still perceived as real time. Naturally, no update is triggered if no new data has been received or if the received data is not relevant.
