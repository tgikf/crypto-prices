import Card from "@suid/material/Card";
import Typography from "@suid/material/Typography";
import Box from "@suid/material/Box";
import Button from "@suid/material/Button";
import Input from "@suid/material/Input";
import evaluatePrice from "./utils/utils";

const BidAskCard = (props: {
  price: {
    bid: string;
    bidProvider: string;
    ask: string;
    askProvider: string;
  };
  placeOrder: (price: string, buySell: "buy" | "sell") => void;
}) => {
  let {
    price: { bid, bidProvider, ask, askProvider },
  } = props;
  const { placeOrder } = props;

  const [highlightStart, highlightEnd, cutoff] = evaluatePrice(bid, ask);
  if (cutoff) {
    bid = bid.slice(0, cutoff);
    ask = ask.slice(0, cutoff);
  }

  const renderPrice = (
    price: string,
    provider: string,
    type: "bid" | "ask"
  ) => (
    <Box
      sx={{
        bgcolor: "primary.light",
        width: "50%",
        [type === "bid" ? "borderRight" : "borderLeft"]: 1,
        borderColor: "background.default",
        display: "flex",
        justifyContent: "flex-end",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        cursor: "pointer",
        userSelect: "none",
        color: "background.default",
        "&:hover": {
          color: type === "bid" ? "#2576e8 !important" : "#ab47bc !important",
          backgroundColor: "text.primary",
        },
      }}
      onClick={() => placeOrder(price, type === "bid" ? "sell" : "buy")}
    >
      {highlightStart && highlightEnd ? (
        <Box>
          <Typography variant="body2" component="span">
            {price.slice(0, highlightStart)}
          </Typography>
          <Typography
            variant="body2"
            component="span"
            sx={{
              fontSize: "2em",
              lineHeight: "1",
              fontWeight: "bold",
            }}
          >
            {price.slice(highlightStart, highlightEnd)}
          </Typography>
          <Typography
            variant="body2"
            component="span"
            sx={{ fontWeight: "bold" }}
          >
            {price.slice(highlightEnd)}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" component="span">
          {price}
        </Typography>
      )}
      <Typography
        variant="body1"
        sx={{
          alignSelf: type === "bid" ? "flex-start" : "flex-end",
          margin: "0 0.5em 0 0.5em",
        }}
      >
        {provider}
      </Typography>
    </Box>
  );

  return (
    <>
      <Card
        sx={{
          display: "flex",
          justifyContent: "space-around",
          height: 90,
        }}
      >
        {renderPrice(bid, bidProvider, "bid")}
        {renderPrice(ask, askProvider, "ask")}
      </Card>
      <Box
        sx={{
          margin: "0.5em auto",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="contained"
          size="small"
          sx={{ color: "#ffffff !important" }}
          disabled
        >
          Bid
        </Button>
        <Box
          sx={{ border: 1, borderRadius: "4px", padding: "0 0.5em 0 0.5em" }}
        >
          $
          <Input type="number" sx={{ width: "7em", marginLeft: "0.5em" }} />
        </Box>

        <Button
          variant="contained"
          size="small"
          sx={{ color: "#ffffff !important" }}
          disabled
        >
          Ask
        </Button>
      </Box>
    </>
  );
};

export default BidAskCard;
