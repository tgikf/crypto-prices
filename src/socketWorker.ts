//@ts-ignore
let SocketHandler = undefined;
//@ts-ignore
onmessage = async (e: MessageEvent<string>) => {
  console.debug(
    "received message socket worker",
    e,
    "sockethandler is",
    SocketHandler
  );

  const { default: BinanceSocketHandler } = await import(
    "./sockethandlers/BinanceSocketHandler"
  );
  const { default: CoinbaseSocketHandler } = await import(
    "./sockethandlers/CoinbaseSocketHandler"
  );
  const { default: SocketHandlers } = await import(
    "./sockethandlers/SocketHandlers"
  );
  const { default: SocketHandlerOperations } = await import(
    "./sockethandlers/SocketHandlerOperations"
  );

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
    case SocketHandlerOperations.SUBSCRIBE:
      SocketHandler.subscribe(symbol);
      break;
    case SocketHandlerOperations.UNSUBSCRIBE:
      SocketHandler.unsubscribe(symbol);
      break;
    default:
      console.debug(`Received invalid operation ${operation}`);
  }
};
