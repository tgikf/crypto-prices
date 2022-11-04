import FormattedPriceUpdate from "./FormattedPriceUpdate";

abstract class GenericSocketHandler {
  protected socket: WebSocket;
  protected readonly provider: string;
  constructor(protected readonly symbol: string) {}

  abstract connect(): void;
  abstract isUpdateDue(unformatted: any): boolean;
  abstract getFormattedPriceUpdate(unformatted: any): FormattedPriceUpdate;
}

export default GenericSocketHandler;
