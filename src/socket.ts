//@ts-ignore
onmessage = (e: MessageEvent<string>) => {
  console.log("received message", e);
  const socket = new WebSocket(
    `wss://stream.binance.com:443/ws/${e.data}@bookTicker`
  );

  socket.onopen = (event) => {
    console.log("opened", event);
  };

  socket.onmessage = (message) => {
    console.log("message", message);
    postMessage(JSON.stringify(message.data));
  };
};
