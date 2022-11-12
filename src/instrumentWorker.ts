//@ts-ignore
let socketsPort = undefined;

const priceData: {
  [key: string]: {
    bid?: string;
    bidProvider?: string;
    ask?: string;
    askProvider?: string;
    providers: string[];
  };
} = {};

let priceDataCurrentUpdate, priceDataLastUpdate;

const processIncomingMessage = (message: any): boolean => {
  const { symbol, provider, ask, bid } = message.data;
  let eventRelevant = false;
  if (!symbol || !provider || !ask || !bid) {
    return false;
  }
  if (priceData[symbol] === undefined) {
    priceData[symbol] = {
      providers: [],
    };
  }

  /* update bid if
   - bid is empty
   - new bid is better
   - new bid is from current bid provider (i.e., their bid got worse)
  */
  if (
    !priceData[symbol].bid ||
    priceData[symbol].bidProvider === provider ||
    bid > priceData[symbol].bid
  ) {
    priceData[symbol].bid = Number(bid).toFixed(6);
    priceData[symbol].bidProvider = provider;
    eventRelevant = true;
  }

  /* update ask if
   - ask is empty
   - new ask is better
   - new ask is from current bid provider (i.e., their ask got worse)
  */
  if (
    !priceData[symbol].ask ||
    priceData[symbol].askProvider === provider ||
    ask < priceData[symbol].ask
  ) {
    priceData[symbol].ask = Number(ask).toFixed(6);
    priceData[symbol].askProvider = provider;
    eventRelevant = true;
  }

  if (
    priceData[symbol].providers.length <= 0 ||
    !priceData[symbol].providers.includes(provider)
  ) {
    priceData[symbol].providers.push(provider);
    eventRelevant = true;
  }
  if (eventRelevant) {
    priceDataCurrentUpdate = Date.now();
  }
  return eventRelevant;
};

setInterval(() => {
  for (const [symbol, data] of Object.entries(priceData)) {
    if (
      data.bid &&
      data.ask &&
      (!priceDataLastUpdate || priceDataCurrentUpdate > priceDataLastUpdate)
    )
      postMessage({
        operation: 4, //WorkerMessageOperations.PRICE_UPDATE,
        symbol,
        data: priceData,
      });
    priceDataLastUpdate = priceDataCurrentUpdate;
  }
}, 100);

onmessage = (e: MessageEvent) => {
  const { operation, symbol, sharedWorkerPort } = e.data as unknown as {
    operation: number;
    symbol?: string;
    sharedWorkerPort?: any;
  };

  switch (operation) {
    case 5: // WorkerMessageOperations.SOCKET_WORKER_PORT:
      socketsPort = sharedWorkerPort;
      socketsPort.onmessage = processIncomingMessage;
      /*socketsPort.postMessage({
        operation: 6, // WorkerMessageOperations.IDENTIFY_DEDICATED_WORKER,
        symbol,
      });*/
      self.postMessage({
        operation: 0, // WorkerMessageOperations.SOCKET_READY,
      });
      break;
    case 2: // WorkerMessageOperations.SUBSCRIBE_FEED:
      socketsPort.postMessage({ operation, symbol });
      break;
    case 3: //WorkerMessageOperations.UNSUBSCRIBE_FEED:
      socketsPort.postMessage({ operation, symbol });
      break;
    default:
      console.error(
        `instrumentWorker: Received invalid operation ${operation}`
      );
  }
};

//@ts-ignore
import("./global").then(({ LOG_LEVEL_DEBUG }) => {
  if (!LOG_LEVEL_DEBUG) {
    self.console.debug = () => {};
  }
});
