import { createSignal } from "solid-js";
import { ThemeProvider, createTheme } from "@suid/material/styles";
import Grid from "@suid/material/Grid";
import Switch from "@suid/material/Switch";
import Typography from "@suid/material/Typography";
import Instrument from "./components/Instrument";
import Box from "@suid/material/Box";
import FormattedPriceUpdate from "./sockets/FormattedPriceUpdate";
import initializeWorkers from "./initializeWorkers";
import SocketHandlerOperations from "./sockets/SocketHandlerOperations";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const App = () => {
  const [subscriptions, setSubscriptions] = createSignal<{
    [pair: string]: { [provider: string]: FormattedPriceUpdate };
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

  const workers = initializeWorkers(processSocketEvent);

  const addOrRemoveSymbol = (add: boolean, symbol: string) => {
    console.log("addOrRemove", add);
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
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Grid
        container
        spacing={2}
        sx={{ height: "100vh", bgcolor: "background.paper" }}
      >
        <Grid item xs={12} sm={3} md={2}>
          <Typography variant="h5" color="text.primary">
            Trading Pairs
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-around",
              gap: "0.2rem",
            }}
          >
            {supportedSymbols.map((symbol) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 0.1rem 0 0.1rem",
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
                    Object.keys(subscriptions()).includes(symbol)
                      ? addOrRemoveSymbol(false, symbol)
                      : addOrRemoveSymbol(true, symbol)
                  }
                />
              </Box>
            ))}
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          sm={9}
          md={10}
          sx={{ display: "flex", justifyContent: "center", gap: "3rem" }}
        >
          {Object.entries(subscriptions()).map(([key, value]) => {
            console.debug("value for", key, "is", value, subscriptions());
            return <Instrument symbol={key} prices={value} />;
          })}
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default App;
