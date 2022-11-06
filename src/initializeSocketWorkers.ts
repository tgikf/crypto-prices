import SocketHandlers from "./sockethandlers/SocketHandlers";
import SocketHandlerOperations from "./sockethandlers/SocketHandlerOperations";

const initializeSocketWorkers = (
  onMessageCallback: (e: MessageEvent) => void
): { [key in SocketHandlers]?: Worker } => {
  const workers: { [key in SocketHandlers]?: Worker } = {};

  Object.values(SocketHandlers)
    .filter((value) => typeof value === "string")
    .forEach((handler) => {
      const worker = new Worker(new URL("./socketWorker.ts", import.meta.url));
      worker.onmessage = onMessageCallback;
      workers[handler] = worker;
    });
  return workers;
};

export default initializeSocketWorkers;
