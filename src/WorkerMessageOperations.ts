enum WorkerMessageOperations {
  SOCKET_READY,
  TERMINATE_CHILDREN,
  SUBSCRIBE_FEED,
  UNSUBSCRIBE_FEED,
  PRICE_UPDATE,
  SHARED_WORKER_PORT,
  IDENTIFY_DEDICATED_WORKER,
}

export default WorkerMessageOperations;
