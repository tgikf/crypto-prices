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
import { createSignal, Index } from "solid-js";
import Popper from "@suid/material/Popper";

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

  const [anchorEl, setAnchorEl] = createSignal<HTMLElement | null>(null);
  const open = () => !!anchorEl();
  const id = () => (open() ? "simple-popper" : undefined);

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
        <IconButton
          aria-label="Info"
          onMouseEnter={(event) => {
            setAnchorEl(event.currentTarget);
          }}
          onMouseLeave={(event) => {
            setAnchorEl(null);
          }}
        >
          <InfoIcon />
        </IconButton>
        <Popper id={id()} open={open()} anchorEl={anchorEl()}>
          <Card
            sx={{
              bgcolor: "secondary.light",
              color: "background.default",
              padding: "0.5em",
            }}
          >
            <Typography variant="body1">
              <Typography variant="body1">{`Orders for ${symbol} are sourced from ${price.providers.join(
                ", "
              )}`}</Typography>
            </Typography>
          </Card>
        </Popper>
      </CardActions>
    </Card>
  );
};

export default Instrument;
