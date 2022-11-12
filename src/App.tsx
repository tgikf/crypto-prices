import { createSignal, For } from "solid-js";
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

  const [socketReady, setSocketReady] = createSignal<boolean>(false);
  const [subscribedSymbols, setSubscribedSymbols] = createSignal<string[]>([]);
  const [orders, setOrders] = createSignal<
    { date: Date; pair: string; price: string; buySell: string }[]
  >([]);

  const placeOrder = (
    date: Date,
    pair: string,
    price: string,
    buySell: "buy" | "sell"
  ) => setOrders([...orders(), { date, pair, price, buySell }]);

  const sharedSocketWorker = new SharedWorker(
    new URL("./socketWorker.ts", import.meta.url)
  );

  const instrumentWorker = new Worker(
    new URL("./instrumentWorker.ts", import.meta.url)
  );

  instrumentWorker.postMessage(
    {
      operation: WorkerMessageOperations.SHARED_WORKER_PORT,
      sharedWorkerPort: sharedSocketWorker.port,
    },
    [sharedSocketWorker.port]
  );

  instrumentWorker.onmessage = (e) => {
    const { operation, data } = e.data;
    switch (operation) {
      case WorkerMessageOperations.SOCKET_READY:
        setSocketReady(true);
      case WorkerMessageOperations.PRICE_UPDATE:
        const newData = {};
        for (const symbol of subscribedSymbols()) {
          newData[symbol] = data[symbol];
        }
        setInstruments({
          ...instruments(),
          ...newData,
        });
        break;
      default:
        console.error(`App: Received invalid operation ${operation}`, e.data);
        break;
    }
  };

  const subscribeToSymbol = (symbol: string) => {
    setSubscribedSymbols([...subscribedSymbols(), symbol]);
    instrumentWorker.postMessage({
      operation: WorkerMessageOperations.SUBSCRIBE_FEED,
      symbol,
    });
  };

  const unsubscribeFromSymbol = (symbol: string) => {
    instrumentWorker.postMessage({
      operation: WorkerMessageOperations.UNSUBSCRIBE_FEED,
      symbol,
    });
    setSubscribedSymbols(subscribedSymbols().filter((e) => e !== symbol));
    setInstruments({ ...instruments(), [symbol]: undefined });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <Grid container padding={2} spacing={2}>
          <Grid item sm={12} md={6} lg={4}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "center",
                marginTop: 10,
              }}
            >
              <ButtonPanel
                disabled={!socketReady()}
                subscribeToSymbol={subscribeToSymbol}
                unsubscribeFromSymbol={unsubscribeFromSymbol}
                symbolSubscribed={(symbol) => {
                  return subscribedSymbols().includes(symbol);
                }}
              />
              <OrderHistory orders={orders()} />
            </Box>
          </Grid>
          <Grid item sm={12} md={6} lg={8}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "center",
                marginTop: 10,
              }}
            >
              <For each={Object.entries(instruments())}>
                {([key, value]) =>
                  value ? (
                    <Instrument
                      symbol={key}
                      price={value}
                      placeOrder={placeOrder}
                    />
                  ) : (
                    <></>
                  )
                }
              </For>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default App;
