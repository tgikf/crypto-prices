import { createSignal, Setter } from "solid-js";
import Button from "@suid/material/Button";
import Grid from "@suid/material/Grid";

const App = () => {
  const [subscriptions, setSubscriptions] = createSignal({});

  const pairs = ["btceur", "ethbtc", "btcusdt", "ethusd", "ethusdt"];
  const workers: { [key: string]: Worker } = {};

  const spawnWorker = (pair: string) => {
    if (workers[pair]) {
      workers[pair].terminate();
    }
    const worker = new Worker(new URL("./worker.ts", import.meta.url));
    worker.onmessage = (e) => {
      const updateReceived = JSON.parse(e.data);
      console.log("subscriptions before", subscriptions());
      setSubscriptions({
        ...subscriptions(),
        [pair]: {
          ...subscriptions()[pair],
          [updateReceived.provider]: updateReceived,
        },
      });
      console.log("subscriptions after", subscriptions());
    };
    worker.postMessage(pair);
    workers[pair] = worker;
  };

  const destroyWorker = (pair: string) => workers[pair].terminate();

  return (
    <Grid container spacing={2}>
      {pairs.map((pair) => (
        <>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" onClick={() => spawnWorker(pair)}>
              Create Worker
            </Button>
            <Button variant="contained" onClick={() => destroyWorker(pair)}>
              Destroy Worker
            </Button>
          </Grid>
          <Grid item xs={12} sm={8}>
            <h1>{pair}</h1>
            {JSON.stringify(subscriptions()[pair])}
          </Grid>
        </>
      ))}
    </Grid>
  );
};

export default App;
