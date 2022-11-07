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
    const color = position === "left" ? "primary.main" : "secondary.main";
    return (
      <Box
        sx={{
          bgcolor: color,
          width: "50%",
          [position === "left" ? "borderRight" : "borderLeft"]: 1,
          borderColor: "background.default",
          display: "flex",
          justifyContent: "flex-end",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          transition: "background-color 1000ms step-end",
        }}
      >
        {highlightStart && highlightEnd ? (
          <Box>
            <Typography
              variant="body2"
              color={"background.default"}
              component="span"
            >
              {price.slice(0, highlightStart)}
            </Typography>
            <Typography
              variant="body2"
              color="background.default"
              component="span"
              sx={{
                fontSize: "2em",
                lineHeight: "1",
              }}
            >
              {price.slice(highlightStart, highlightEnd)}
            </Typography>
            <Typography
              variant="body2"
              color="background.default"
              component="span"
            >
              {price.slice(highlightEnd)}
            </Typography>
          </Box>
        ) : (
          <Typography
            variant="body2"
            color="background.default"
            component="span"
          >
            {price}
          </Typography>
        )}
        <Typography
          variant="body1"
          color="background.default"
          sx={{
            alignSelf: position === "right" ? "flex-end" : "flex-start",
            margin: "0 0.5em 0 0.5em",
          }}
        >
          {provider}
        </Typography>
      </Box>
    );
  };

  return (
    <Card
      sx={{
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
