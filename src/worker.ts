//@ts-ignore
let socketHandler = undefined;
//@ts-ignore
onmessage = async (e: MessageEvent<string>) => {
  console.debug("event", e);

  const { default: BinanceSocketHandler } = await import(
    "./sockets/BinanceSocketHandler"
  );
  const { default: CoinbaseSocketHandler } = await import(
    "./sockets/CoinbaseSocketHandler"
  );
  const { default: SocketHandlers } = await import("./sockets/SocketHandlers");
  const { default: SocketHandlerOperations } = await import(
    "./sockets/SocketHandlerOperations"
  );

  const handlers = {
    [SocketHandlers.BINANCE]: BinanceSocketHandler,
    [SocketHandlers.COINBASE]: CoinbaseSocketHandler,
  };

  const { handler, operation, symbol } = e.data as unknown as {
    handler: number;
    operation: number;
    symbol?: string;
  };

  console.debug("about to instantiate:(", handler, operation, symbol);
  if (socketHandler === undefined) {
    socketHandler = new handlers[handler]();
  }
  switch (operation) {
    case SocketHandlerOperations.SUBSCRIBE:
      socketHandler.subscribe(symbol);
      break;
    case SocketHandlerOperations.UNSUBSCRIBE:
      socketHandler.unsubscribe(symbol);
      break;
    default:
      console.debug(`Received invalid operation ${operation}`);
  }
};
