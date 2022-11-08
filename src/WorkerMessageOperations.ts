enum WorkerMessageOperations {
  SOCKET_READY,
  TERMINATE_SELF,
  TERMINATE_CHILDREN,
  SUBSCRIBE_FEED,
  UNSUBSCRIBE_FEED,
  PRICE_UPDATE,
  SOCKET_WORKER_PORT,
}

export default WorkerMessageOperations;
