import ProviderPrice from "./ProviderPrice";

abstract class GenericSocketHandler {
  protected socket: WebSocket;
  protected readonly provider: string;
  protected subscribedSymbols: string[];
  abstract subscribe(symbol: string): void;
  abstract unsubscribe(symbol: string): void;
  abstract isRelevant(message: any): boolean;
  abstract isUpdateDue(unformatted: any): boolean;
  abstract getFormattedPriceUpdate(unformatted: any): ProviderPrice;

  sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  close(): void {
    this.socket.close();
  }

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
