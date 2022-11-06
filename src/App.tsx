import { createSignal } from "solid-js";
import { ThemeProvider, createTheme } from "@suid/material/styles";
import Switch from "@suid/material/Switch";
import Typography from "@suid/material/Typography";
import Instrument from "./components/Instrument";
import Box from "@suid/material/Box";
import FormattedPriceUpdate from "./sockethandlers/FormattedPriceUpdate";
import WorkerMessageOperations from "./WorkerMessageOperations";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const instrumentWorkers: Worker[] = [];

const App = () => {
  const [subscriptions, setSubscriptions] = createSignal<{
    [pair: string]: { [provider: string]: FormattedPriceUpdate };
  }>({});

  const [instruments, setInstruments] = createSignal<{
    [symbol: string]: FormattedPriceUpdate;
  }>({});

  const supportedSymbols = ["BTCEUR", "ETHBTC", "BTCUSDT", "ETHUSD", "ETHUSDT"];

  const processSocketEvent = (e: MessageEvent) => {
    const priceData: FormattedPriceUpdate = JSON.parse(e.data);
    if (priceData.symbol !== undefined) {
      setSubscriptions({
        ...subscriptions(),
        [priceData.symbol]: {
          ...subscriptions()[priceData.symbol],
          [priceData.provider]: priceData,
        },
      });
    }
  };

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
      const workerMessage = JSON.parse(e.data);
      if (workerMessage.operation === WorkerMessageOperations.SOCKET_READY) {
        worker.postMessage({
          operation: WorkerMessageOperations.SUBSCRIBE_FEED,
          symbol,
        });
      } else if (workerMessage.symobl && workerMessage.provider) {
        setInstruments({ ...instruments(), [symbol]: workerMessage });
      }
    };

    instrumentWorkers[symbol] = worker;

    /*
    Object.entries(workers).forEach(([handler, worker]) => {
      worker.postMessage({
        handler,
        operation: add
          ? SocketHandlerOperations.SUBSCRIBE
          : SocketHandlerOperations.UNSUBSCRIBE,
        symbol,
      });
    });
    if (!add) {
      setSubscriptions({ ...subscriptions(), [symbol]: undefined });
    }*/
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

        {Object.entries(subscriptions()).map(([key, value]) => {
          console.debug("value for", key, "is", value, subscriptions());
          return <Instrument symbol={key} prices={value} />;
        })}
      </Box>
    </ThemeProvider>
  );
};

export default App;
