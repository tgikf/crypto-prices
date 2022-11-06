import Card from "@suid/material/Card";
import Typography from "@suid/material/Typography";
import Box from "@suid/material/Box";

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
    position: "left" | "right"
  ) => {
    console.log(
      "renderPrice",
      price,
      "start",
      highlightStart,
      "end",
      highlightEnd,
      price.slice(0, highlightStart),
      price.slice(highlightStart, highlightEnd),
      price.slice(highlightEnd)
    );
    return (
      <Box
        sx={{
          width: "50%",
          paddingTop: "7%",
          [position === "left" ? "borderRight" : "borderLeft"]: 1,
          borderColor: "background.default",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {highlightStart && highlightEnd ? (
            <>
              <Typography
                variant="body2"
                color="background.default"
                sx={{ marginBlockEnd: -0.8 }}
              >
                {price.slice(0, highlightStart)}
              </Typography>
              <Typography
                variant="body2"
                color="background.default"
                sx={{
                  fontSize: "2em",
                  marginBlockEnd: 0.5,
                  marginLeft: "0.05em",
                }}
              >
                {price.slice(highlightStart, highlightEnd)}
              </Typography>
              <Typography
                variant="body2"
                color="background.default"
                sx={{ marginBlockEnd: -0.8 }}
              >
                {price.slice(highlightEnd)}
              </Typography>
            </>
          ) : (
            <Typography
              variant="body2"
              color="background.default"
              sx={{ marginBlockEnd: -0.8 }}
            >
              {price}
            </Typography>
          )}
        </Box>
        <Typography
          variant="body1"
          color="background.default"
          sx={{ float: position, padding: "0 0.8em 0 0.8em" }}
        >
          {provider}
        </Typography>
      </Box>
    );
  };

  return (
    <Card
      sx={{
        bgcolor: "primary.light",
        display: "flex",
        justifyContent: "space-around",
        height: "6rem",
      }}
    >
      {renderPrice(bid, bidProvider, "left")}
      {renderPrice(ask, askProvider, "right")}
    </Card>
  );
};

export default BidAskCard;
