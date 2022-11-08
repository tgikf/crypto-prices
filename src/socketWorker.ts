import type ProviderPrice from "./sockethandlers/ProviderPrice";
import type SocketHandlers from "./sockethandlers/SocketHandlers";
console.debug("###ANYONEHERE???");

postMessage("where is this landing???");
//@ts-ignore
import("./global").then(({ LOG_LEVEL_DEBUG }) => {
  if (!LOG_LEVEL_DEBUG) {
    self.console.debug = () => {};
  }
});
console.debug("running in socketworker yay222");

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
    console.debug("running in socketworker yay222");
    //@ts-ignore
    onconnect = (e) => {
      const port = e.ports[0];
      const processSocketEvent = (message: ProviderPrice) => {
        console.debug("socket event processed in sowcketworker", message);
        console.debug("posting to port now");
        port.postMessage(message);
      };

      const handlers = [
        BinanceSocketHandler,
        CoinbaseSocketHandler,
        CoinFlexSocketHandler,
        BitmexSocketHandler,
      ].map((Handler) => new Handler(processSocketEvent));

      const readyHandlers: number[] = [];
      handlers.forEach(async (Handler, i) => {
        await Handler.waitForReadyState();
        readyHandlers.push(i);
      });

      onmessage = (e: MessageEvent) => {
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
            console.error(
              `socketWorker: Received invalid operation ${operation}`
            );
        }
      };
    };
  }
);
