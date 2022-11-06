import { createSignal } from "solid-js";
import { ThemeProvider, createTheme } from "@suid/material/styles";
import Switch from "@suid/material/Switch";
import Typography from "@suid/material/Typography";
import Instrument from "./components/Instrument";
import Box from "@suid/material/Box";
import WorkerMessageOperations from "./WorkerMessageOperations";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const instrumentWorkers: Worker[] = [];

const App = () => {
  const [instruments, setInstruments] = createSignal<{
    [symbol: string]: {
      bid: string;
      bidProvider: string;
      ask: string;
      askProvider: string;
      providers: string[];
    };
  }>({});

  const supportedSymbols = ["BTCEUR", "ETHBTC", "BTCUSDT", "ETHUSD", "ETHUSDT"];

  const terminateInstrumentWorker = (symbol: string) => {
    if (instrumentWorkers[symbol] === undefined) {
      return;
    }
    instrumentWorkers[symbol].postMessage({
      operation: WorkerMessageOperations.TERMINATE_WORKER,
    });
    instrumentWorkers[symbol] = undefined;
  };

  const spawnInstrumentWorker = (symbol: string) => {
    if (instrumentWorkers[symbol] !== undefined) {
      instrumentWorkers[symbol].terminate();
    }

    const worker = new Worker(
      new URL("./instrumentWorker.ts", import.meta.url)
    );

    worker.onmessage = (e) => {
      const workerMessage = e.data; //JSON.parse(e.data);
      switch (workerMessage.operation) {
        case WorkerMessageOperations.SOCKET_READY:
          worker.postMessage({
            operation: WorkerMessageOperations.SUBSCRIBE_FEED,
            symbol,
          });
          break;
        case WorkerMessageOperations.PRICE_UPDATE:
          console.debug("received bestprice update", workerMessage.data);
          setInstruments({ ...instruments(), [symbol]: workerMessage.data });
          break;
        default:
          console.error(
            `Received invalid operation ${workerMessage.operation}`,
            workerMessage
          );
          break;
      }
    };

    instrumentWorkers[symbol] = worker;
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.paper" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "1rem",
            padding: "1rem 0 1rem 0",
          }}
        >
          {supportedSymbols.map((symbol) => (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 0 0 0.5rem",
                border: 1,
                borderColor: "primary.main",
                borderRadius: 1,
                width: "8rem",
              }}
            >
              <Typography variant="button" color="text.secondary">
                {symbol}
              </Typography>
              <Switch
                value={symbol}
                onChange={() =>
                  instrumentWorkers[symbol] !== undefined
                    ? terminateInstrumentWorker(symbol)
                    : spawnInstrumentWorker(symbol)
                }
              />
            </Box>
          ))}
        </Box>

        {Object.entries(instruments()).map(([key, value]) => {
          return <Instrument symbol={key} price={value} />;
        })}
      </Box>
    </ThemeProvider>
  );
};

export default App;
