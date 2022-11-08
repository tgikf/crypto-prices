import ProviderPrice from "./ProviderPrice";
import GenericSocketHandler from "./GenericSocketHandler";
import SocketHandlers from "./SocketHandlers";

class BitmexSocketHandler extends GenericSocketHandler {
  provider = SocketHandlers.BITMEX;
  constructor(protected updateParent: (message: ProviderPrice) => void) {
    super();
    this.socket = new WebSocket(`wss://ws.bitmex.com/realtime`);
    this.socket.onopen = (e) => {
      console.debug(`Socket with ${this.provider} opened`, e);
    };

    this.socket.onmessage = (message) => {
      console.debug(`message from ${this.provider}`, message);
      const socketMessage = JSON.parse(message.data);
      if (this.isRelevant(socketMessage)) {
        updateParent(this.getFormattedPriceUpdate(socketMessage));
      }
    };
  }

  subscribe(symbol: string): void {
    const message = JSON.stringify({
      op: "subscribe",
      args: [`orderBook10:${symbol.replaceAll("BTC", "XBT")}`],
    });
    console.debug(`Subscribing to ${symbol} on ${this.provider}`);
    this.socket.send(message);
  }

  unsubscribe(symbol: string): void {
    const message = JSON.stringify({
      op: "unsubscribe",
      args: [`orderBook10:${symbol.replaceAll("BTC", "XBT")}`],
    });
    console.debug(`Subscribing to ${symbol}@bookTicker on ${this.provider}`);
    this.socket.send(message);
  }

  isRelevant(message: any) {
    return (
      message.table === "orderBook10" &&
      message.data[0]?.bids?.length > 0 &&
      message.data[0]?.asks?.length > 0
    );
  }

  isUpdateDue(unformatted: string): boolean {
    return true;
  }

  getFormattedPriceUpdate(data: any): ProviderPrice {
    return {
      symbol: data.data[0].symbol.replaceAll("XBT", "BTC"),
      provider: this.provider,
      bid: data.data[0].bids[0][0],
      ask: data.data[0].asks[0][0],
    };
  }
}

export default BitmexSocketHandler;
