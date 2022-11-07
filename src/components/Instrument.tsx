import Avatar from "@suid/material/Avatar";
import Card from "@suid/material/Card";
import CardActions from "@suid/material/CardActions";
import CardContent from "@suid/material/CardContent";
import CardHeader from "@suid/material/CardHeader";
import IconButton from "@suid/material/IconButton";
import MoreVertIcon from "@suid/icons-material/MoreVert";
import InfoIcon from "@suid/icons-material/Info";
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
}) => {
  const { symbol, price } = props;

  return (
    <Card sx={{ bgcolor: "background.paper", width: 345, maxHeight: 500 }}>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: "text.secondary" }}>SP</Avatar>}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        titleTypographyProps={{ variant: "h6", gutterBottom: false }}
        title={symbol}
        subheader={`${price.providers.length} Providers`}
        subheaderTypographyProps={{ variant: "body1" }}
      />
      <CardContent>
        <BidAskCard price={price} />
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
                  <Typography variant="body1">{`Order data for ${symbol} has been sourced from ${price.providers.join(
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
