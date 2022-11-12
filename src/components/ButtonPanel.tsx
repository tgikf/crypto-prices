import Box from "@suid/material/Box";
import Card from "@suid/material/Card";
import CardContent from "@suid/material/CardContent";
import CardHeader from "@suid/material/CardHeader";
import Typography from "@suid/material/Typography";
import Switch from "@suid/material/Switch";
import { For } from "solid-js";

const ButtonPanel = (props: {
  disabled: boolean;
  subscribeToSymbol: (symbol: string) => void;
  unsubscribeFromSymbol: (symbol: string) => void;
  symbolSubscribed: (symbol: string) => boolean;
}) => {
  const { subscribeToSymbol, unsubscribeFromSymbol, symbolSubscribed } = props;

  const supportedSymbols = [
    "BTCEUR",
    "ETHBTC",
    "BTCUSDT",
    "ETHUSD",
    "ETHUSDT",
    "XRPUSD",
    "XRPUSDT",
    "DOGEUSDT",
  ];

  return (
    <Card
      sx={{
        bgcolor: "background.paper",
        minWidth: 310,
        width: "95%",
        maxHeight: 500,
      }}
    >
      <CardHeader
        titleTypographyProps={{ variant: "h6", gutterBottom: false }}
        title="Cryptocurrency Pairs"
        subheader={`Flip the toggle to receive real-time price data for the respective trading pair`}
        subheaderTypographyProps={{ variant: "body1" }}
      />
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "1rem",
            padding: "1rem 0 1rem 0",
          }}
        >
          <For each={supportedSymbols}>
            {(symbol) => (
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
                <Typography
                  variant="button"
                  color="text.secondary"
                  sx={{ paddingTop: "0.1rem" }}
                >
                  {symbol}
                </Typography>
                <Switch
                  disabled={props.disabled}
                  value={symbol}
                  onChange={() =>
                    symbolSubscribed(symbol)
                      ? unsubscribeFromSymbol(symbol)
                      : subscribeToSymbol(symbol)
                  }
                />
              </Box>
            )}
          </For>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ButtonPanel;
