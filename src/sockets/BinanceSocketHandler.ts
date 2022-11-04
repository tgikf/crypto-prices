import FormattedPriceUpdate from "./FormattedPriceUpdate";
import GenericSocketHandler from "./GenericSocketHandler";

class BinanceSocketHandler extends GenericSocketHandler {
  provider = "Binance";

  connect(): void {
    this.socket = new WebSocket(
      `wss://stream.binance.com:443/ws/${this.symbol.toLowerCase()}@bookTicker`
    );
    this.socket.onopen = (e) => {
      console.log(`${this.symbol} opened on ${this.provider}`, e);
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
      bid: data.b,
      ask: data.a,
    };
  }
}

export default BinanceSocketHandler;
