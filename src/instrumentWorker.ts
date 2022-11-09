//@ts-ignore
let socketsPort = undefined;

const priceData: {
  bid?: string;
  bidProvider?: string;
  ask?: string;
  askProvider?: string;
  providers: string[];
} = { providers: [] };

let priceDataCurrentUpdate, priceDataLastUpdate;

const processIncomingMessage = (message: any): boolean => {
  const { symbol, provider, ask, bid } = message.data;
  let eventRelevant = false;
  if (!symbol || !provider || !ask || !bid) {
    return false;
  }

  /* update bid if
   - bid is empty
   - new bid is better
   - new bid is from current bid provider (i.e., their bid got worse)
*/
  if (
    !priceData.bid ||
    priceData.bidProvider === provider ||
    bid > priceData.bid
  ) {
    priceData.bid = Number(bid).toFixed(6);
    priceData.bidProvider = provider;
    eventRelevant = true;
  }

  /* update bid if
   - bid is empty
   - new bid is better
   - new bid is from current bid provider (i.e., their bid got worse)
*/
  if (
    !priceData.ask ||
    priceData.askProvider === provider ||
    ask < priceData.ask
  ) {
    priceData.ask = Number(ask).toFixed(6);
    priceData.askProvider = provider;
    eventRelevant = true;
  }

  if (
    priceData.providers.length <= 0 ||
    !priceData.providers.includes(provider)
  ) {
    priceData.providers.push(provider);
    eventRelevant = true;
  }
  if (eventRelevant) {
    priceDataCurrentUpdate = Date.now();
  }
  return eventRelevant;
};

setInterval(() => {
  if (
    priceData.bid &&
    priceData.ask &&
    (!priceDataLastUpdate || priceDataCurrentUpdate > priceDataLastUpdate)
  )
    postMessage({
      operation: 4, //WorkerMessageOperations.PRICE_UPDATE,
      data: priceData,
    });
  priceDataLastUpdate = priceDataCurrentUpdate;
}, 120);

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
      socketsPort.postMessage({
        operation: 6, // WorkerMessageOperations.IDENTIFY_DEDICATED_WORKER,
        symbol,
      });
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
