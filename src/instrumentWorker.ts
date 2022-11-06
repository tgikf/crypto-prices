//@ts-ignore
import("./global").then(({ default: LOG_LEVEL_DEBUG }) => {
  if (!LOG_LEVEL_DEBUG) {
    self.console.debug = () => {};
  }
});

Promise.all([
  import("./initializeSocketWorkers"),
  import("./WorkerMessageOperations"),
]).then(
  ([
    { default: initializeSocketWorkers },
    { default: WorkerMessageOperations },
  ]) => {
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

      // Bid is better if larger
      if (!instrumentData.bid || bid > instrumentData.bid) {
        instrumentData.bid = Number(bid).toFixed(4);
        instrumentData.bidProvider = provider;
        eventRelevant = true;
      }

      // Ask is better if smaller
      if (!instrumentData.ask || ask < instrumentData.ask) {
        instrumentData.ask = Number(ask).toFixed(4);
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

    const processSocketEvent = (e: MessageEvent): void => {
      if (instrumentDataChanged(e.data)) {
        postMessage({
          operation: WorkerMessageOperations.PRICE_UPDATE,
          data: instrumentData,
        });
      }
    };

    const socketWorkers = initializeSocketWorkers(processSocketEvent);
    /*TODO: fix delay in worker spawning and remove settimeout
    appears to be connected to the imports inside the worker 
    (can it be resolved by separate imports inside async function?)*/
    setTimeout(() => {
      postMessage({ operation: WorkerMessageOperations.SOCKET_READY });
    }, 200);

    onmessage = (e: MessageEvent) => {
      if (e.data.operation === WorkerMessageOperations.TERMINATE_WORKER) {
        Object.values(socketWorkers).forEach((worker) => worker.terminate());
        this.close();
      } else {
        Object.entries(socketWorkers).forEach(([key, worker]) =>
          worker.postMessage({ ...e.data, handler: key })
        );
      }
    };
  }
);
