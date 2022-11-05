import FormattedPriceUpdate from "./FormattedPriceUpdate";

abstract class GenericSocketHandler {
  protected socket: WebSocket;
  protected readonly provider: string;
  protected subscribedSymbols: string[];
  abstract subscribe(symbol: string): void;
  abstract unsubscribe(symbol: string): void;
  abstract isRelevant(message: any): boolean;
  abstract isUpdateDue(unformatted: any): boolean;
  abstract getFormattedPriceUpdate(unformatted: any): FormattedPriceUpdate;
}

export default GenericSocketHandler;
