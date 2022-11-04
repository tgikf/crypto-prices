import FormattedPriceUpdate from "./FormattedPriceUpdate";
import GenericSocketHandler from "./GenericSocketHandler";

class CoinbaseSocketHandler extends GenericSocketHandler {
  provider = "Coinbase";

  connect(): void {
    this.socket = new WebSocket(`wss://ws-feed.exchange.coinbase.com`);
    this.socket.onopen = (e) => {
      console.log(`${this.symbol} opened on ${this.provider}`, e);
      const productId = `${this.symbol.slice(0, 3)}-${this.symbol.slice(
        3
      )}`.toUpperCase();
      this.socket.send(
        JSON.stringify({
          type: "subscribe",
          channels: [
            "level2",
            {
              name: "ticker",
              product_ids: [productId],
            },
          ],
        })
      );
    };
    this.socket.onmessage = (message) => {
      console.log(`message for ${this.symbol} from ${this.provider}`, message);
      const priceData = JSON.parse(message.data);
      postMessage(JSON.stringify(this.getFormattedPriceUpdate(priceData)));
    };
  }

  isUpdateDue(unformatted: string): boolean {
    return true;
  }

  getFormattedPriceUpdate(data: any): FormattedPriceUpdate {
    return {
      symbol: this.symbol,
      provider: this.provider,
      bid: data.best_bid,
      ask: data.best_ask,
    };
  }
}

export default CoinbaseSocketHandler;
