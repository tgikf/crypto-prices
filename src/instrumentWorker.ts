//@ts-ignore
import("./initializeSocketWorkers").then(
  ({ default: initializeSocketWorkers }) => {
    const processSocketEvent = (e: MessageEvent): void => {
      const priceData = JSON.parse(e.data);
      console.log("handleDataUpdate", priceData);
    };

    const socketWorkers = initializeSocketWorkers(processSocketEvent);
    console.log("at this point sockets should be ready!", socketWorkers);
    postMessage(JSON.stringify({ message: "WORKER_READY" }));

    onmessage = async (e: MessageEvent) => {
      Object.entries(socketWorkers).forEach(([key, worker]) =>
        worker.postMessage({ ...e.data, handler: key })
      );
      console.debug("received message instrument worker", e);
    };
  }
);
