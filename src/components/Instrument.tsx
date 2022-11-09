import Avatar from "@suid/material/Avatar";
import Card from "@suid/material/Card";
import CardActions from "@suid/material/CardActions";
import CardContent from "@suid/material/CardContent";
import CardHeader from "@suid/material/CardHeader";
import IconButton from "@suid/material/IconButton";
import Chip from "@suid/material/Chip";
import InfoIcon from "@suid/icons-material/Info";
import CurrencyBitcoinIcon from "@suid/icons-material/CurrencyBitcoin";

import BidAskCard from "./BidAskCard";
import Typography from "@suid/material/Typography";
import { OverlayTrigger, Tooltip } from "solid-bootstrap";

const Instrument = (props: {
  symbol: string;
  price: {
    bid: string;
    bidProvider: string;
    ask: string;
    askProvider: string;
    providers: string[];
  };
  placeOrder: (
    date: Date,
    pair: string,
    price: string,
    buySell: "buy" | "sell"
  ) => void;
}) => {
  const { symbol, price, placeOrder } = props;
  const submitOrder = (price: string, buySell: "buy" | "sell") =>
    placeOrder(new Date(), symbol, price, buySell);
  return (
    <Card sx={{ bgcolor: "background.paper", width: 345, maxHeight: 500 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "secondary.main" }}>
            <CurrencyBitcoinIcon />
          </Avatar>
        }
        action={<Chip label="SPOT" sx={{ margin: "8px" }} />}
        titleTypographyProps={{ variant: "h6", gutterBottom: false }}
        title={symbol}
        subheader={`${price.providers.length} Providers`}
        subheaderTypographyProps={{ variant: "body1" }}
      />
      <CardContent>
        <BidAskCard price={price} placeOrder={submitOrder} />
      </CardContent>
      <CardActions disableSpacing>
        {price.providers.length > 0 && (
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip color="primary" id="info">
                <Card
                  sx={{
                    bgcolor: "secondary.light",
                    color: "background.default",
                    padding: "0.5em",
                  }}
                >
                  <Typography variant="body1">{`Orders for ${symbol} are sourced from ${price.providers.join(
                    ", "
                  )}`}</Typography>
                </Card>
              </Tooltip>
            }
          >
            <IconButton aria-label="Info">
              <InfoIcon />
            </IconButton>
          </OverlayTrigger>
        )}
      </CardActions>
    </Card>
  );
};

export default Instrument;
