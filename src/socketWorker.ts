//@ts-ignore
Promise.all([
  import("./sockethandlers/BinanceSocketHandler"),
  import("./sockethandlers/CoinbaseSocketHandler"),
  import("./WorkerMessageOperations"),
  import("./sockethandlers/SocketHandlers"),
]).then(
  ([
    { default: BinanceSocketHandler },
    { default: CoinbaseSocketHandler },
    { default: WorkerMessageOperations },
    { default: SocketHandlers },
  ]) => {
    let SocketHandler = undefined;
    onmessage = async (e: MessageEvent) => {
      const handlers = {
        [SocketHandlers.BINANCE]: BinanceSocketHandler,
        [SocketHandlers.COINBASE]: CoinbaseSocketHandler,
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
