import Avatar from "@suid/material/Avatar";
import Card from "@suid/material/Card";
import CardActions from "@suid/material/CardActions";
import CardContent from "@suid/material/CardContent";
import CardHeader from "@suid/material/CardHeader";
import IconButton from "@suid/material/IconButton";
import MoreVertIcon from "@suid/icons-material/MoreVert";
import FavoriteIcon from "@suid/icons-material/Favorite";
import InfoIcon from "@suid/icons-material/Info";
import BidAskCard from "./BidAskCard";

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
    <Card sx={{ bgcolor: "background.light", width: 345, maxHeight: 500 }}>
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
