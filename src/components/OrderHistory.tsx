import Card from "@suid/material/Card";
import CardContent from "@suid/material/CardContent";
import CardHeader from "@suid/material/CardHeader";
import Paper from "@suid/material/Paper";
import Table from "@suid/material/Table";
import TableBody from "@suid/material/TableBody";
import TableCell from "@suid/material/TableCell";
import TableContainer from "@suid/material/TableContainer";
import TableHead from "@suid/material/TableHead";
import TableRow from "@suid/material/TableRow";
import Typography from "@suid/material/Typography";
import { For } from "solid-js";

const OrderHistory = (props: {
  orders: {
    date: Date;
    pair: string;
    price: string;
    buySell: string;
  }[];
}) => {
  const { orders } = props;
  return (
    <Card sx={{ bgcolor: "background.paper", width: 690, maxHeight: 500 }}>
      <CardHeader
        titleTypographyProps={{ variant: "h6", gutterBottom: false }}
        title="Order History"
        subheader={`Orders can be placed by clicking on the respective price button.`}
        subheaderTypographyProps={{ variant: "body1" }}
      />
      <CardContent>
        {orders.length > 0 ? (
          <TableContainer component={Paper} sx={{ bgcolor: "" }}>
            <Table sx={{ minWidth: 400 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date/Time</TableCell>
                  <TableCell>Pair</TableCell>
                  <TableCell>Buy/Sell</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, i) => (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell scope="row">
                      {new Date(order.date).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{order.buySell}</TableCell>
                    <TableCell>{order.pair}</TableCell>
                    <TableCell align="right">{order.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="h5">Mytext </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
