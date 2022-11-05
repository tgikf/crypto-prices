import Avatar from "@suid/material/Avatar";
import Card from "@suid/material/Card";
import CardActions from "@suid/material/CardActions";
import CardContent from "@suid/material/CardContent";
import CardHeader from "@suid/material/CardHeader";
import CardMedia from "@suid/material/CardMedia";
import IconButton from "@suid/material/IconButton";
import Typography from "@suid/material/Typography";
import MoreVertIcon from "@suid/icons-material/MoreVert";
import FavoriteIcon from "@suid/icons-material/Favorite";
import InfoIcon from "@suid/icons-material/Info";
import FormattedPriceUpdate from "../sockets/FormattedPriceUpdate";

const Instrument = (props: {
  symbol: string;
  prices: { [provider: string]: FormattedPriceUpdate };
}) => {
  const { symbol, prices } = props;
  const noOfProviders = Object.keys(prices).length;

  return (
    <Card sx={{ bgcolor: "background.light", width: 345, maxHeight: 500 }}>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: "secondary.main" }}>SP</Avatar>}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        titleTypographyProps={{ variant: "h6", gutterBottom: false }}
        title={symbol}
        subheader={`${noOfProviders} Providers`}
        subheaderTypographyProps={{ variant: "body1" }}
      />
      <CardContent>
        <Typography variant="body2" color="text.primary">
          {`Binance Bid: ${prices["Binance"]?.bid}`} <br />
          {`Coinbase Bid: ${prices["Coinbase"]?.bid}`}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="Info">
          <InfoIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default Instrument;
