//@ts-ignore
Promise.all([
  import("./initializeSocketWorkers"),
  import("./WorkerMessageOperations"),
]).then(
  ([
    { default: initializeSocketWorkers },
    { default: WorkerMessageOperations },
  ]) => {
    const processSocketEvent = (e: MessageEvent): void => {
      const priceData = JSON.parse(e.data);
      console.log("handleDataUpdate", priceData);
    };

    const socketWorkers = initializeSocketWorkers(processSocketEvent);
    setTimeout(() => {
      postMessage(
        JSON.stringify({ operation: WorkerMessageOperations.SOCKET_READY })
      );
    }, 25); //TODO: for some reason the workers need more time to get ready

    onmessage = async (e: MessageEvent) => {
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
