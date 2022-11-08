import type ProviderPrice from "./sockethandlers/ProviderPrice";
import type SocketHandlers from "./sockethandlers/SocketHandlers";

let WorkerMessageOperations;
let processSocketEvent;
let handlers,
  readyHandlers: number[] = [];
Promise.all([
  import("./WorkerMessageOperations"),
  import("./sockethandlers/BinanceSocketHandler"),
  import("./sockethandlers/CoinbaseSocketHandler"),
  import("./sockethandlers/CoinFlexSocketHandler"),
  import("./sockethandlers/BitmexSocketHandler"),
]).then(
  ([
    { default: WMO },
    { default: BinanceSocketHandler },
    { default: CoinbaseSocketHandler },
    { default: CoinFlexSocketHandler },
    { default: BitmexSocketHandler },
  ]) => {
    console.debug("running in socketworker yay222");
    WorkerMessageOperations = WMO;
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
self.onconnect = (e) => {
  const port = e.ports[0];
  processSocketEvent = (message: ProviderPrice) => {
    console.debug("socket event processed in sowcketworker", message);
    console.debug("posting to port now");
    port.postMessage(message);
  };

  port.onmessage = (e: MessageEvent) => {
    console.debug("got something lol", e);
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
        handlers
          .filter((h, i) => readyHandlers.includes(i))
          .forEach((handler) => handler.subscribe(symbol));
        break;
      case WorkerMessageOperations.UNSUBSCRIBE_FEED:
        handlers.forEach((handler) => handler.unsubscribe(symbol));
        break;
      default:
        console.error(`socketWorker: Received invalid operation ${operation}`);
    }
  };
};

//@ts-ignore
import("./global").then(({ LOG_LEVEL_DEBUG }) => {
  if (!LOG_LEVEL_DEBUG) {
    self.console.debug = () => {};
  }
});
