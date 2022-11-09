import type GenericSocketHandler from "./sockethandlers/GenericSocketHandler";
import type ProviderPrice from "./sockethandlers/ProviderPrice";

let processSocketEvent;
let handlers: GenericSocketHandler[] = [];
const readyHandlers: number[] = [];

const ports = {};
//@ts-ignore
self.onconnect = (e) => {
  const port = e.ports[0];
  processSocketEvent = (message: ProviderPrice) => {
    ports[message.symbol].postMessage(message);
  };

  port.onmessage = (e: MessageEvent) => {
    const { operation, symbol } = e.data as unknown as {
      operation: number;
      symbol?: string;
    };

    switch (operation) {
      case 6: // WorkerMessageOperations.IDENTIFY_DEDICATED_WORKER:
        ports[symbol] = port;
        break;
      case 1: // WorkerMessageOperations.TERMINATE_CHILDREN:
        handlers.forEach((handler) => handler.close());
        self.close();
        break;
      case 2: // WorkerMessageOperations.SUBSCRIBE_FEED:
        handlers
          .filter((h, i) => readyHandlers.includes(i))
          .forEach((handler) => handler.subscribe(symbol));
        break;
      case 3: // WorkerMessageOperations.UNSUBSCRIBE_FEED:
        handlers.forEach((handler) => handler.unsubscribe(symbol));
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
