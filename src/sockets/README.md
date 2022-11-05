# Concerns

- Is it okay to create a new socket for each symbol and exchange? If not enhance socket classes with subscribe methods. Generally, makes client side logic a easier (pro) but possibly leads to excessive socket connections.

# Sockets used

## Binance

https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams

> wss://stream.binance.com:443/ws/btcusdt@bookTicker

Example message:

```
{
  "u":26863797667,
  "s":"BTCUSDT",
  "b":"20769.45000000",
  "B":"0.02712000",
  "a":"20769.46000000",
  "A":"0.01308000"
}
```

## Coinbase

https://docs.cloud.coinbase.com/exchange/docs/websocket-overview

> wss://ws-feed.exchange.coinbase.com

Ticker is only every second, but easier to parse update. `level2_batch` will send an update and then only changes (more sophisticated parsing required).
Example message:

```
{
  "type": "ticker",
  "sequence": 38274727931,
  "product_id": "ETH-USD",
  "price": "1624.35",
  "open_24h": "1546.52",
  "volume_24h": "540923.07749588",
  "low_24h": "1524.27",
  "high_24h": "1677",
  "volume_30d": "10981141.23169071",
  "best_bid": "1624.09",
  "best_bid_size": "0.36940952",
  "best_ask": "1624.35",
  "best_ask_size": "0.91301000",
  "side": "buy",
  "time": "2022-11-04T16:35:54.674429Z",
  "trade_id": 378405471,
  "last_size": "0.1"
}
```

### Questions:

- What is the `side` property? Are both `buy` and `sell` to be treated equally when the best ask or bid is to be found?
