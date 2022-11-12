import type GenericSocketHandler from "./sockethandlers/GenericSocketHandler";
import type ProviderPrice from "./sockethandlers/ProviderPrice";

let processSocketEvent;
let handlers: GenericSocketHandler[] = [];
const readyHandlers: number[] = [];

//@ts-ignore
self.onconnect = (e) => {
  const port = e.ports[0];
  processSocketEvent = (message: ProviderPrice) => {
    port.postMessage(message);
  };

  port.onmessage = (e: MessageEvent) => {
    const { operation, symbol } = e.data as unknown as {
      operation: number;
      symbol?: string;
    };

    switch (operation) {
      /* case 6: // WorkerMessageOperations.IDENTIFY_DEDICATED_WORKER:
        ports[symbol] = port;
        break;*/
      case 1: // WorkerMessageOperations.TERMINATE_CHILDREN:
        handlers.forEach((handler) => handler.close());
        self.close();
        break;
      case 2: // WorkerMessageOperations.SUBSCRIBE_FEED:
        for (let i = 0; i < handlers.length; i++) {
          if (readyHandlers.includes(i)) {
            handlers[i].subscribe(symbol);
          }
        }
        break;
      case 3: // WorkerMessageOperations.UNSUBSCRIBE_FEED:
        for (let i = 0; i < handlers.length; i++) {
          if (readyHandlers.includes(i)) {
            handlers[i].unsubscribe(symbol);
          }
        }
        break;
      default:
        console.error(`socketWorker: Received invalid operation ${operation}`);
    }
  };
};

Promise.all([
  import("./sockethandlers/BinanceSocketHandler"),
  import("./sockethandlers/CoinbaseSocketHandler"),
  import("./sockethandlers/CoinFlexSocketHandler"),
  import("./sockethandlers/BitmexSocketHandler"),
]).then(
  ([
    { default: BinanceSocketHandler },
    { default: CoinbaseSocketHandler },
    { default: CoinFlexSocketHandler },
    { default: BitmexSocketHandler },
  ]) => {
    handlers = [
      BinanceSocketHandler,
      CoinbaseSocketHandler,
      CoinFlexSocketHandler,
      BitmexSocketHandler,
    ].map((Handler) => new Handler(processSocketEvent));

    handlers.forEach(async (Handler, i) => {
      await Handler.waitForReadyState();
      readyHandlers.push(i);
    });
  }
);

//@ts-ignore
import("./global").then(({ LOG_LEVEL_DEBUG }) => {
  if (!LOG_LEVEL_DEBUG) {
    self.console.debug = () => {};
  }
});
