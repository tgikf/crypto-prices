import ProviderPrice from "./ProviderPrice";

abstract class GenericSocketHandler {
  protected socket: WebSocket;
  public readonly provider: string;
  protected subscribedSymbols: string[];
  protected bestPrice: ProviderPrice;
  private lastPrice: ProviderPrice;

  abstract subscribe(symbol: string): void;
  abstract unsubscribe(symbol: string): void;
  abstract isRelevant(message: any): boolean;
  abstract isUpdateDue(unformatted: any): boolean;
  abstract updateBestPrice(unformatted: any): void;

  constructor(protected updateParent: (message: ProviderPrice) => void) {
    const start = Date.now();

    /* Socket level throttling: update the parent only if the price has changed and at interval
       To prevent very active sockets from DoS-ing the instrument worker
    */
    setInterval(() => {
      if (this.bestPrice?.symbol && this.bestPrice !== this.lastPrice) {
        this.lastPrice = this.bestPrice;
        updateParent(this.bestPrice);
      }
    }, 150);
  }

  sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  close(): void {
    this.socket.close();
  }

  publish(): void {}

  async waitForReadyState(): Promise<void> {
    let timeToConnect = 0;
    const TIME_LIMIT = 5000;
    while (
      this.socket.readyState !== this.socket.OPEN &&
      timeToConnect < TIME_LIMIT
    ) {
      await this.sleep(10);
      timeToConnect += 10;
    }
    if (this.socket.readyState !== this.socket.OPEN) {
      console.error(
        `Socket with ${this.provider} didn't open within ${
          TIME_LIMIT / 1000
        } seconds`
      );
    }
  }
}

export default GenericSocketHandler;
