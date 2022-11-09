import ProviderPrice from "./ProviderPrice";
import GenericSocketHandler from "./GenericSocketHandler";
import SocketHandlers from "./SocketHandlers";

class CoinFlexSocketHandler extends GenericSocketHandler {
  provider = SocketHandlers.COINFLEX;

  constructor(protected publishUpdate: (message: ProviderPrice) => void) {
    super(publishUpdate);
    this.socket = new WebSocket(`wss://v2api.coinflex.com/v2/websocket`);
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
      op: "subscribe",
      tag: 103,
      args: [`depth:${productId}-SWAP-LIN`],
    });
    console.debug(`Subscribing to ${symbol} on ${this.provider}`);
    this.socket.send(message);
  }

  unsubscribe(symbol: string): void {
    const productId = `${symbol.slice(0, 3)}-${symbol.slice(3)}`;
    const message = JSON.stringify({
      op: "unsubscribe",
      tag: 103,
      args: [`depth:${productId}-SWAP-LIN`],
    });
    console.debug(`Unsubscribing from ${symbol} on ${this.provider}`);
    this.socket.send(message);
  }

  isRelevant(message: any) {
    return (
      message.table === "depth" &&
      message.data?.bids?.length > 0 &&
      message.data?.asks?.length > 0
    );
  }

  updateBestPrice(data: any): void {
    const symbol = data.data.marketCode.substring(0, 7).replaceAll("-", "");
    this.bestPrices[symbol] = {
      symbol,
      provider: this.provider,
      bid: data.data.bids[0][0],
      ask: data.data.asks[0][0],
    };
  }
}

export default CoinFlexSocketHandler;
