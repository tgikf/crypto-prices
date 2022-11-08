import type ProviderPrice from "./sockethandlers/ProviderPrice";
import type SocketHandlers from "./sockethandlers/SocketHandlers";

//@ts-ignore
import("./global").then(({ LOG_LEVEL_DEBUG }) => {
  if (!LOG_LEVEL_DEBUG) {
    self.console.debug = () => {};
  }
});

Promise.all([import("./WorkerMessageOperations")]).then(
  ([{ default: WorkerMessageOperations }]) => {
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

    let socketsPort;

    onmessage = (e: MessageEvent) => {
      const { operation, symbol, handler, socketWorkerPort } =
        e.data as unknown as {
          operation: number;
          symbol?: string;
          handler?: SocketHandlers;
          socketWorkerPort?: any;
        };
      switch (operation) {
        case WorkerMessageOperations.SOCKET_WORKER_PORT:
          socketsPort: socketWorkerPort;
        case WorkerMessageOperations.SUBSCRIBE_FEED:
          socketsPort.postMessage({ operation, symbol });
          break;
        case WorkerMessageOperations.UNSUBSCRIBE_FEED:
          socketsPort.postMessage({ operation, symbol });
          break;
        default:
          console.error(
            `instrumentWorker: Received invalid operation ${operation}`
          );
      }
    };
  }
);
