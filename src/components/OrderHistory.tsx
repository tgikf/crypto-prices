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
  return (
    <Card
      sx={{
        bgcolor: "background.paper",
        minWidth: 290,
        maxHeight: 650,
        width: "95%",
      }}
    >
      <CardHeader
        titleTypographyProps={{ variant: "h6", gutterBottom: false }}
        title="Order History"
        subheader={`Orders can be placed by clicking on the respective price button.`}
        subheaderTypographyProps={{ variant: "body1" }}
      />
      <CardContent>
        {props.orders.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{ bgcolor: "", maxHeight: 500 }}
          >
            <Table size="small" stickyHeader sx={{ minWidth: 400 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date/Time</TableCell>
                  <TableCell>Pair</TableCell>
                  <TableCell>Buy/Sell</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {props.orders.map((order, i) => (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell scope="row">
                      {`${new Date(order.date).toLocaleDateString()} ${new Date(
                        order.date
                      ).toLocaleTimeString()}`}
                    </TableCell>
                    <TableCell>{order.pair}</TableCell>
                    <TableCell>{order.buySell}</TableCell>
                    <TableCell align="right">{order.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="h6" align="center">
            No orders
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
