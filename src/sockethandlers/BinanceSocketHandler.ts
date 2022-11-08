import ProviderPrice from "./ProviderPrice";
import GenericSocketHandler from "./GenericSocketHandler";
import SocketHandlers from "./SocketHandlers";

class BinanceSocketHandler extends GenericSocketHandler {
  provider = SocketHandlers.BINANCE;

  constructor(protected updateParent: (message: ProviderPrice) => void) {
    super();
    this.socket = new WebSocket(`wss://stream.binance.com:443/ws`);
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
      method: "SUBSCRIBE",
      params: [`${symbol.toLowerCase()}@bookTicker`],
      id: 1,
    });
    console.debug(`Subscribing to ${symbol}@bookTicker on ${this.provider}`);
    this.socket.send(message);
  }

  unsubscribe(symbol: string): void {
    const message = JSON.stringify({
      method: "UNSUBSCRIBE",
      params: [`${symbol.toLowerCase()}@bookTicker`],
      id: 1,
    });
    console.debug(`Subscribing to ${symbol}@bookTicker on ${this.provider}`);
    this.socket.send(message);
  }

  isRelevant(message: any) {
    return message.s !== undefined;
  }

  isUpdateDue(unformatted: string): boolean {
    return true;
  }

  getFormattedPriceUpdate(data: any): ProviderPrice {
    return {
      symbol: data.s,
      provider: this.provider,
      bid: data.b,
      ask: data.a,
    };
  }
}

export default BinanceSocketHandler;
