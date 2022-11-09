# Crypto Prices

This repository hosts a small client-side web app, that serves as a prototype for a real-time Cryptocurrency price/order data aggregation app.

## Tech Stack and Tools

The prototype is based on [Solid.js](https://www.solidjs.com/) written in TypeScript. While it's new to me and less adopted than for instance React, I chose it because of its [`solid` performance in benchmarks with other libraries and frameworks](https://krausest.github.io/js-framework-benchmark/2022/table_chrome_107.0.5304.62.html). In addition to that, [Vite](https://vitejs.dev/) is used as dev server and build tool.

## Focus Areas

### Connectivity to Market Data providers

A price data aggregator is only helpful if it provides a consolidated market view that otherwise isn't widely available. Hence, the aggregator is only as good as the number of data sources it aggregates.

To address this problem, connections to data providers were implemented with a typical inheritance based polymorphism pattern.
The base class is [`GenericSocketHandler`](./src/sockethandlers/GenericSocketHandler.ts), which consists of a some abstract methods ands implements general WebSocket related methods and an event dispatcher for data updates at a predefined interval (see Throttling).
On top of that, each connected data provider has their specific `SocketHandler`, that takes care of the use cases that are provider specific. Most notably these include:

- Socket subscription (e.g., to the `orderbook10` stream on Bitmex but the `@bookTicker` stream on Binance)
- Exchange specific trading symbol mapping (e.g., `XBT` vs `BTC`)

[![](https://mermaid.ink/img/pako:eNqNkktOAzEMhq8SeQWivUDECiFgg4QYITaz8SQuRM0DOQ5Qld6dTCmIikxLNk7sz_5jy2swyRJoMB5zvnT4xBj6qOq5pkjsTJfMkuQGo_XE6vxjPlcXLmI0tBc5kKPV2SMNXz6Vt2aarrDxKdPJ6UHmDZ1cJb4ntKtOUI7xLgrxK_qHF3sE_m5RAr03OmwExgZzGbJhN_yUnuBK_C-5SBxQ7ur3fpF_5z4h3gab6m10Tx5mEKi-na2bsh4Te5BnCtSDrleLvOyhj5vKYZHUraIBLVxoBmU78N1igV6gz9VL1kni293qjWbzCUL_36Q?type=png)](https://mermaid.live/edit#pako:eNqNkktOAzEMhq8SeQWivUDECiFgg4QYITaz8SQuRM0DOQ5Qld6dTCmIikxLNk7sz_5jy2swyRJoMB5zvnT4xBj6qOq5pkjsTJfMkuQGo_XE6vxjPlcXLmI0tBc5kKPV2SMNXz6Vt2aarrDxKdPJ6UHmDZ1cJb4ntKtOUI7xLgrxK_qHF3sE_m5RAr03OmwExgZzGbJhN_yUnuBK_C-5SBxQ7ur3fpF_5z4h3gab6m10Tx5mEKi-na2bsh4Te5BnCtSDrleLvOyhj5vKYZHUraIBLVxoBmU78N1igV6gz9VL1kni293qjWbzCUL_36Q)

This pattern makes it easy to extend the list of providers on top of the currently supported 4 providers.

### Threading Model

Given the nature of the app, it has to potentially display a user `n` trading paris with constant order updates coming in from `m` providers. Performing all that inside the browser's main thread would most definitely have disastrous impact on the usability of the web app.

When selecting the threading model, I made the following considerations:

- Isolating the main thread from any data retrieval and other heavy processing by ensuring it only gets invoked when changes **have** to be displayed to the user
- Balancing the expected performance improvement with the multi threading overhead, the design/effort implications on the application and the hardware limits (a CPU core can only run 2 threads at any one time)

After some experimentation, I eventually implemented the model illustrated below, consisting of:

- A single Shared Worker that establishes connectivity with all websockets
- A Dedicated Worker per instrument pair that communicates with the SharedWorker to subscribe to data events and decides when to update the UI

[![](https://mermaid.ink/img/pako:eNp1kLEOwjAMRH_F8kx_IHMHlk5FYsliEkOjEqdyUiHU9t-JgAWpbNbp3el8C7rkGQ2ytoFuStFKR0FOgzJ5gHVtmrRCP5CyPycdWcFAnugheYdcoGUfHJUd-CfjL-1SjLO8xT3PusCZL31yI5cjib-z5uoKkgtJCR8XHjCyRgq-PrZYAbBYBo5s0dTTk44WrWyVo7mk_ikOTdGZDzhPvmZ8p0BzpXuuam1Zknafpd6DbS9YeG_6?type=png)](https://mermaid.live/edit#pako:eNp1kLEOwjAMRH_F8kx_IHMHlk5FYsliEkOjEqdyUiHU9t-JgAWpbNbp3el8C7rkGQ2ytoFuStFKR0FOgzJ5gHVtmrRCP5CyPycdWcFAnugheYdcoGUfHJUd-CfjL-1SjLO8xT3PusCZL31yI5cjib-z5uoKkgtJCR8XHjCyRgq-PrZYAbBYBo5s0dTTk44WrWyVo7mk_ikOTdGZDzhPvmZ8p0BzpXuuam1Zknafpd6DbS9YeG_6)

### Throttling and Conflation

With connectivity to large exchanges such as Binance, subscribing to a popular trading pair will lead to the app receiving messages every few milliseconds even when just subscribing to a single stream of a single exchange. Rendering all updates, as relevant as they may be, in real time will not only be of no use to the user but likely also have a negative impact on performance.

To address this problem, the `SocketHandler` instances throttle the incoming data streams and currently only publish an update to the shared worker every `150` milliseconds. This throttling is implemented in[`GenericSocketHandler.ts`](./src/sockethandlers/GenericSocketHandler.ts) and equally applied to all sockets, regardless of the actual incoming message volume. Naturally, if there was no price update within 150 milliseconds, no `publish` event will be triggered.

With each socket publish event being moved to though JS event loop before it's being executed, however, there's a slight risk of synchronization issues (e.g., comparing price 2 from `exchange A` with price 1 from `exchange B` while price 2 from `exchange B` has arrived at the socket but not been updated). To address that, the Dedicated Worker of each trading pair, which publishes meaningful price updates to the Main Thread, runs every `120ms`.

## Challenges and Shortcomings

During the brief implementation phase of this prototype I faced various problems of different nature, some of which I think are worthy of mention here.

- Integration of Shared and Dedicated Workers

  While the JavaScript Workers follow a conceptually simple concept, I faced a lot of issues related to communication between the workers. The message API is in my opinion rather primitive and does not come with developer-friendly handling of asynchronous activities.

  Furthermore, code reuse inside the workers turned out to be nightmare. The only solution I could find to make it work were dynamic imports, which have a performance impact on their own. In some cases, I ended up just hardcoding values, to avoid async issues coming from importing an `enum` (see [`socketWorker.ts`](./src/socketWorker.ts)). It would take more time to find a production-ready solution to the problem, as it is difficult to pinpoint the problem and rule out side-effects (e.g., from bundler).

- Overall performance and responsiveness of the UI

  Even with the threading model outlined above, the app still has performance issues:

  - When 5+ instruments are subscribed to, it visibly impacts the browser responsiveness (e.g., when resizing the browser window)
  - The order placement functionality (i.e., click on price button) is largely unavailable, either because the price clicked has already been changed or because the browser is overwhelmed and the click is stuck somewhere in the event queue

  Although I didn't find time to verify, I believe that spawning one Dedicated Worker thread per trading pair is probably excessive and does more harm than good. In a future solution I would look to find a way to group multiple instruments in a single Dedicated Worker.

  On top of that, doing more research into `Solid.js` and putting its performance-dedicated feature to better use could likely also benefit the app performance and responsiveness under high workload.
