//@ts-ignore
onmessage = async (e: MessageEvent<string>) => {
  const { default: BinanceSocketHandler } = await import(
    "./sockets/BinanceSocketHandler"
  );

  const { default: CoinbaseSocketHandler } = await import(
    "./sockets/CoinbaseSocketHandler"
  );

  const handlers = [BinanceSocketHandler, CoinbaseSocketHandler];
  handlers.forEach((Handler) => {
    const socketHandler = new Handler(e.data);
    socketHandler.connect();
  });
};
