import Box from "@suid/material/Box";
import Card from "@suid/material/Card";
import CardContent from "@suid/material/CardContent";
import CardHeader from "@suid/material/CardHeader";
import Typography from "@suid/material/Typography";
import Switch from "@suid/material/Switch";

const ButtonPanel = (props: {
  spawnWorker: (symbol: string) => void;
  terminateWorker: (symbol: string) => void;
  workerExists: (symbol: string) => boolean;
}) => {
  const { spawnWorker, terminateWorker, workerExists } = props;
  const supportedSymbols = ["BTCEUR", "ETHBTC", "BTCUSDT", "ETHUSD", "ETHUSDT"];

  return (
    <Card
      sx={{
        bgcolor: "background.paper",
        minWidth: 400,
        maxWidth: 1000,
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
              <Typography
                variant="button"
                color="text.secondary"
                sx={{ paddingTop: "0.1rem" }}
              >
                {symbol}
              </Typography>
              <Switch
                value={symbol}
                onChange={() =>
                  workerExists(symbol)
                    ? terminateWorker(symbol)
                    : spawnWorker(symbol)
                }
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ButtonPanel;
