import Card from "@suid/material/Card";
import Typography from "@suid/material/Typography";
import Box from "@suid/material/Box";
import Button from "@suid/material/Button";
import Input from "@suid/material/Input";

const BidAskCard = (props: {
  price: {
    bid: string;
    bidProvider: string;
    ask: string;
    askProvider: string;
  };
}) => {
  const {
    price: { bid, bidProvider, ask, askProvider },
  } = props;

  const getHighlightedPricePart = (bid: string, ask: string) => {
    let start, end;
    [...bid].some((digit, i) => {
      if (digit !== ask.charAt(i)) {
        start = i;
        end = ask.charAt(i + 1) === "." ? i + 3 : i + 2;
        end = end > ask.length ? ask.length : end;
        return true;
      }
    });

    return [start, end];
  };

  const [highlightStart, highlightEnd] = getHighlightedPricePart(bid, ask);

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
          color: type === "bid" ? "#42a5f5 !important" : "#ab47bc !important",
          backgroundColor: "text.primary",
        },
      }}
      onClick={() => console.log("placed offer for", type, " at ", price)}
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
            }}
          >
            {price.slice(highlightStart, highlightEnd)}
          </Typography>
          <Typography variant="body2" component="span">
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

  const spread = (Number(ask) - Number(bid)).toFixed(4);

  return (
    <>
      <Card
        sx={{
          margin: "auto",
          width: "5em",
          bgcolor: "secondary.light",
          borderColor: "background.default",
        }}
      >
        <Typography
          variant="body2"
          color="background.default"
          sx={{ textAlign: "center", fontSize: "1em" }}
        >
          {spread === "0.0000" ? "n/a" : spread}
        </Typography>
      </Card>
      <Card
        sx={{
          display: "flex",
          justifyContent: "space-around",
          height: "6rem",
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
