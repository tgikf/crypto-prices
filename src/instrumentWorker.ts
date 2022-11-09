//@ts-ignore
let socketsPort = undefined;

const instrumentData: {
  bid?: string;
  bidProvider?: string;
  ask?: string;
  askProvider?: string;
  providers: string[];
} = { providers: [] };

const instrumentDataChanged = (priceData: any): boolean => {
  const { symbol, provider, ask, bid } = priceData;
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
    !instrumentData.bid ||
    instrumentData.bidProvider === provider ||
    bid > instrumentData.bid
  ) {
    instrumentData.bid = Number(bid).toFixed(6);
    instrumentData.bidProvider = provider;
    eventRelevant = true;
  }

  /* update bid if
   - bid is empty
   - new bid is better
   - new bid is from current bid provider (i.e., their bid got worse)
*/
  if (
    !instrumentData.ask ||
    instrumentData.askProvider === provider ||
    ask < instrumentData.ask
  ) {
    instrumentData.ask = Number(ask).toFixed(6);
    instrumentData.askProvider = provider;
    eventRelevant = true;
  }

  if (
    instrumentData.providers.length <= 0 ||
    !instrumentData.providers.includes(provider)
  ) {
    instrumentData.providers.push(provider);
    eventRelevant = true;
  }
  return eventRelevant;
};

const socketMessageListener = (message) => {
  if (instrumentDataChanged(message.data)) {
    postMessage({
      operation: 4, //WorkerMessageOperations.PRICE_UPDATE,
      data: instrumentData,
    });
  }
};

onmessage = (e: MessageEvent) => {
  const { operation, symbol, sharedWorkerPort } = e.data as unknown as {
    operation: number;
    symbol?: string;
    sharedWorkerPort?: any;
  };

  console.debug(`In ${self.name} for operation ${operation} at ${Date.now()}`);
  switch (operation) {
    case 5: // WorkerMessageOperations.SOCKET_WORKER_PORT:
      socketsPort = sharedWorkerPort;
      socketsPort.onmessage = socketMessageListener;
      socketsPort.postMessage({
        operation: 6, // WorkerMessageOperations.IDENTIFY_DEDICATED_WORKER,
        symbol,
      });
      setTimeout(() => {
        self.postMessage({
          operation: 0, // WorkerMessageOperations.SOCKET_READY,
        });
      }, 500);
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
