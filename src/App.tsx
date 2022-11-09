import { createSignal } from "solid-js";
import { ThemeProvider, createTheme } from "@suid/material/styles";
import Instrument from "./components/Instrument";
import Box from "@suid/material/Box";
import WorkerMessageOperations from "./WorkerMessageOperations";
import OrderHistory from "./components/OrderHistory";
import ButtonPanel from "./components/ButtonPanel";
import Grid from "@suid/material/Grid";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: "Roboto",
    body2: {
      fontSize: "1.2rem",
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

  const [orders, setOrders] = createSignal<
    { date: Date; pair: string; price: string; buySell: string }[]
  >([]);

  const placeOrder = (
    date: Date,
    pair: string,
    price: string,
    buySell: "buy" | "sell"
  ) => setOrders([...orders(), { date, pair, price, buySell }]);

  /*const orders = [
    { date: Date.now(), pair: "BTCEUR", price: "18300.312", buySell: "Buy" },
    { date: Date.now(), pair: "ETHUSDT", price: "2000.0012", buySell: "Buy" },
    { date: Date.now(), pair: "BTCETH", price: "8.014", buySell: "Sell" },
  ];*/

  const terminateInstrumentWorker = (symbol: string) => {
    if (instrumentWorkers[symbol] === undefined) {
      return;
    }
    instrumentWorkers[symbol].postMessage({
      operation: WorkerMessageOperations.UNSUBSCRIBE_FEED,
      symbol,
    });
    delete instrumentWorkers[symbol];
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
          if (instrumentWorkers[symbol] !== undefined) {
            setInstruments({
              ...instruments(),
              [symbol]: data,
            });
          }
          break;
        default:
          console.error(`App: Received invalid operation ${operation}`, e.data);
          break;
      }
    };
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }}
      >
        <Grid container padding={2} spacing={2}>
          <Grid
            item
            sm={12}
            md={6}
            justifyContent="space-around"
            alignItems="center"
            direction="row"
          >
            <ButtonPanel
              spawnWorker={spawnInstrumentWorker}
              terminateWorker={terminateInstrumentWorker}
              workerExists={(symbol) => instrumentWorkers[symbol] !== undefined}
            />
          </Grid>
          <Grid item sm={12} md={6}>
            <OrderHistory orders={orders()} />
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          {Object.entries(instruments()).map(([key, value]) =>
            value ? (
              <Instrument symbol={key} price={value} placeOrder={placeOrder} />
            ) : (
              <></>
            )
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
