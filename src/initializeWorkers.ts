import SocketHandlers from "./sockets/SocketHandlers";
import SocketHandlerOperations from "./sockets/SocketHandlerOperations";

const initializeWorkers = (
  onMessageCallback: (e: MessageEvent) => void
): { [key in SocketHandlers]?: Worker } => {
  console.debug("initializing workers");
  const workers: { [key in SocketHandlers]?: Worker } = {};
  Object.values(SocketHandlers)
    .filter((value) => typeof value === "string")
    .forEach((handler) => {
      console.debug(`Starting worker for ${handler}`);

      const worker = new Worker(new URL("./worker.ts", import.meta.url));
      worker.onmessage = onMessageCallback;
      worker.postMessage({
        handler,
        operation: SocketHandlerOperations.CONNECT,
      });
      workers[handler] = worker;
    });

  return workers;
};

export default initializeWorkers;
