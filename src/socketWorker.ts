//@ts-ignore
import("./global").then(({ default: LOG_LEVEL_DEBUG }) => {
  if (!LOG_LEVEL_DEBUG) {
    self.console.debug = () => {};
  }
});

Promise.all([
  import("./sockethandlers/BinanceSocketHandler"),
  import("./sockethandlers/CoinbaseSocketHandler"),
  import("./sockethandlers/CoinFlexSocketHandler"),
  import("./sockethandlers/BitmexSocketHandler"),
  import("./WorkerMessageOperations"),
  import("./sockethandlers/SocketHandlers"),
]).then(
  ([
    { default: BinanceSocketHandler },
    { default: CoinbaseSocketHandler },
    { default: CoinFlexSocketHandler },
    { default: BitmexSocketHandler },
    { default: WorkerMessageOperations },
    { default: SocketHandlers },
  ]) => {
    let SocketHandler = undefined;
    onmessage = async (e: MessageEvent) => {
      const handlers = {
        [SocketHandlers.BINANCE]: BinanceSocketHandler,
        [SocketHandlers.COINBASE]: CoinbaseSocketHandler,
        [SocketHandlers.COINFLEX]: CoinFlexSocketHandler,
        [SocketHandlers.BITMEX]: BitmexSocketHandler,
      };

      const { handler, operation, symbol } = e.data as unknown as {
        handler: string;
        operation: number;
        symbol?: string;
      };

      if (SocketHandler === undefined) {
        SocketHandler = new handlers[handler]();
        await SocketHandler.waitForReadyState();
      }
      switch (operation) {
        case WorkerMessageOperations.SUBSCRIBE_FEED:
          SocketHandler.subscribe(symbol);
          break;
        case WorkerMessageOperations.UNSUBSCRIBE_FEED:
          SocketHandler.unsubscribe(symbol);
          break;
        default:
          console.error(`Received invalid operation ${operation}`);
      }
    };
  }
);
