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
  typography: {
    fontFamily: "Roboto",
    body2: {
      fontSize: "1.2rem",
      fontWeight: "bold",
      fontFamily: "Noto Sans",
      letterSpacing: "0px",
    },
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
      operation: WorkerMessageOperations.UNSUBSCRIBE_FEED,
      symbol,
    });
    instrumentWorkers[symbol] = undefined;
    setInstruments({ ...instruments(), [symbol]: undefined });
  };

  const spawnInstrumentWorker = (symbol: string) => {
    if (instrumentWorkers[symbol] !== undefined) {
      instrumentWorkers[symbol].terminate();
    }
    const sharedSocketWorker = new SharedWorker(
      new URL("./socketWorker.ts", import.meta.url)
    );

    const instrumentWorker = new Worker(
      new URL("./instrumentWorker.ts", import.meta.url)
    );

    instrumentWorkers[symbol] = instrumentWorker;

    instrumentWorker.postMessage(
      {
        operation: WorkerMessageOperations.SHARED_WORKER_PORT,
        symbol: symbol,
        sharedWorkerPort: sharedSocketWorker.port,
      },
      [sharedSocketWorker.port]
    );

    instrumentWorker.onmessage = (e) => {
      const { operation, data } = e.data;
      switch (operation) {
        case WorkerMessageOperations.SOCKET_READY:
          // FIXME: upon first pair addition, give sockets time to connect
          const timeout = Object.keys(instruments()).length === 0 ? 1500 : 0;
          setTimeout(() => {
            instrumentWorker.postMessage({
              operation: WorkerMessageOperations.SUBSCRIBE_FEED,
              symbol,
            });
          }, timeout);

          break;
        case WorkerMessageOperations.PRICE_UPDATE:
          setInstruments({
            ...instruments(),
            [symbol]: data,
          });
          break;
        default:
          console.error(`App: Received invalid operation ${operation}`, e.data);
          break;
      }
    };
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {/*
          <Instrument
            symbol={"ETHABC"}
            price={{
              bid: "21066.14020",
              ask: "21067.34020",
              bidProvider: "Benance",
              askProvider: "Citi",
              providers: [],
            }}
          />
          <Instrument
            symbol={"ETHDEF"}
            price={{
              bid: "21066.14020",
              ask: "21066.14020",
              bidProvider: "Benance",
              askProvider: "Citi",
              providers: [],
            }}
          /> */}
          {Object.entries(instruments()).map(([key, value]) =>
            value ? <Instrument symbol={key} price={value} /> : <></>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
