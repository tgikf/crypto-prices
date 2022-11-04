import { createSignal, Setter } from "solid-js";
import Button from "@suid/material/Button";
import Grid from "@suid/material/Grid";

let worker: Worker;

const createWorker = (func: Setter<string>) => {
  console.log("clicked");
  worker = new Worker(new URL("./socket.ts", import.meta.url));
  worker.onmessage = (e) => {
    console.log("received from worker", e);
    func(e.data);
  };
  worker.postMessage("btcusdt");
};

const destroyWorker = () => worker.terminate();

const App = () => {
  const [name, setName] = createSignal("Herbert");

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Button variant="contained" onClick={() => createWorker(setName)}>
          Create Worker
        </Button>
        <Button variant="contained" onClick={destroyWorker}>
          Destroy Worker
        </Button>
      </Grid>
      <Grid item xs={12} sm={8}>
        {name}
      </Grid>
    </Grid>
  );
};

export default App;
