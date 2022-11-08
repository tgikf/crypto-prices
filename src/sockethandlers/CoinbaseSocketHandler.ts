import ProviderPrice from "./ProviderPrice";
import GenericSocketHandler from "./GenericSocketHandler";
import SocketHandlers from "./SocketHandlers";

class CoinbaseSocketHandler extends GenericSocketHandler {
  provider = SocketHandlers.COINBASE;

  constructor(protected updateParent: (message: ProviderPrice) => void) {
    super(updateParent);
    this.socket = new WebSocket(`wss://ws-feed.exchange.coinbase.com`);
    this.socket.onopen = (e) => {
      console.debug(`Socket with ${this.provider} opened`, e);
    };

    this.socket.onmessage = (message) => {
      console.debug(`message from ${this.provider}`, message);
      const socketMessage = JSON.parse(message.data);
      if (this.isRelevant(socketMessage)) {
        this.updateBestPrice(socketMessage);
      }
    };
  }

  subscribe(symbol: string): void {
    const productId = `${symbol.slice(0, 3)}-${symbol.slice(3)}`;
    const message = JSON.stringify({
      type: "subscribe",
      product_ids: [productId],
      channels: ["ticker"],
    });
    console.debug(`Subscribing to ${symbol} level2 on ${this.provider}`);
    this.socket.send(message);
  }

  unsubscribe(symbol: string): void {
    const productId = `${symbol.slice(0, 3)}-${symbol.slice(3)}`;
    const message = JSON.stringify({
      type: "unsubscribe",
      product_ids: [productId],
      channels: ["ticker"],
    });
    console.debug(`Unsubscribing from ${symbol} level2 on ${this.provider}`);
    this.socket.send(message);
  }

  isRelevant(message: any) {
    return message.type === "ticker";
  }

  isUpdateDue(unformatted: string): boolean {
    return true;
  }

  updateBestPrice(data: any): void {
    this.bestPrice = {
      symbol: data.product_id.replaceAll("-", ""),
      provider: this.provider,
      bid: data.best_bid,
      ask: data.best_ask,
    };
  }
}

export default CoinbaseSocketHandler;
