import type ProviderPrice from "./sockethandlers/ProviderPrice";
import type SocketHandlers from "./sockethandlers/SocketHandlers";

//@ts-ignore
import("./global").then(({ LOG_LEVEL_DEBUG }) => {
  if (!LOG_LEVEL_DEBUG) {
    self.console.debug = () => {};
  }
});

Promise.all([
  import("./WorkerMessageOperations"),
  import("./sockethandlers/BinanceSocketHandler"),
  import("./sockethandlers/CoinbaseSocketHandler"),
  import("./sockethandlers/CoinFlexSocketHandler"),
  import("./sockethandlers/BitmexSocketHandler"),
]).then(
  ([
    { default: WorkerMessageOperations },
    { default: BinanceSocketHandler },
    { default: CoinbaseSocketHandler },
    { default: CoinFlexSocketHandler },
    { default: BitmexSocketHandler },
  ]) => {
    const instrumentData: {
      bid?: string;
      bidProvider?: string;
      ask?: string;
      askProvider?: string;
      providers: string[];
    } = { providers: [] };

    const instrumentDataChanged = (priceData: any): boolean => {
      const { symbol, provider, ask, bid } = priceData;
      let eventRelevant = false;

      if (!symbol || !provider || !ask || !bid) {
        return false;
      }

      // Bid is better if larger
      if (!instrumentData.bid || bid > instrumentData.bid) {
        instrumentData.bid = Number(bid).toFixed(6);
        instrumentData.bidProvider = provider;
        eventRelevant = true;
      }

      // Ask is better if smaller
      if (!instrumentData.ask || ask < instrumentData.ask) {
        instrumentData.ask = Number(ask).toFixed(6);
        instrumentData.askProvider = provider;
        eventRelevant = true;
      }

      if (
        instrumentData.providers.length <= 0 ||
        !instrumentData.providers.includes(provider)
      ) {
        instrumentData.providers.push(provider);
        eventRelevant = true;
      }
      console.debug(
        `From ${priceData.provider}: Received ${
          eventRelevant ? "relevant##" : "irrelevant"
        } event for ${priceData.symbol} at ${Date.now()}`,
        priceData
      );
      return eventRelevant;
    };

    const processSocketEvent = (e: ProviderPrice): void => {
      if (instrumentDataChanged(e)) {
        postMessage({
          operation: WorkerMessageOperations.PRICE_UPDATE,
          data: instrumentData,
        });
      }
    };

    const handlers = [
      BinanceSocketHandler,
      CoinbaseSocketHandler,
      CoinFlexSocketHandler,
      BitmexSocketHandler,
    ].map((Handler) => new Handler(processSocketEvent));

    handlers.forEach(async (Handler) => {
      await Handler.waitForReadyState();
      postMessage({
        operation: WorkerMessageOperations.SOCKET_READY,
        handler: Handler.provider,
      });
    });

    onmessage = (e: MessageEvent) => {
      const { operation, symbol, handler } = e.data as unknown as {
        operation: number;
        symbol?: string;
        handler?: SocketHandlers;
      };
      switch (operation) {
        case WorkerMessageOperations.TERMINATE_CHILDREN:
          handlers.forEach((handler) => handler.close());
          self.close();
          break;
        case WorkerMessageOperations.SUBSCRIBE_FEED:
          handlers.filter((h) => h.provider === handler)[0].subscribe(symbol);
          break;
        case WorkerMessageOperations.UNSUBSCRIBE_FEED:
          handlers.forEach((handler) => handler.unsubscribe(symbol));
          break;
        default:
          console.error(
            `socketWorker: Received invalid operation ${operation}`
          );
      }
    };
  }
);
