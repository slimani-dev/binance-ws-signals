export class TradeData {
  constructor(
      public eventType: string,
      public eventTime: number,
      public symbol: string,
      public tradeId: number,
      public price: string,
      public quantity: string,
      public tradeTime: number,
      public isMarketMaker: boolean,
      public ignore: boolean
  ) {}

  static fromJSON(json: any): TradeData {
    return new TradeData(
        json.e,
        json.E,
        json.s,
        json.t,
        json.p,
        json.q,
        json.T,
        json.m,
        json.M
    );
  }
}

export class TradeMessage {
  constructor(
      public stream: string,
      public data: TradeData
  ) {}

  static fromJSON(json: any): TradeMessage {
    return new TradeMessage(
        json.stream,
        TradeData.fromJSON(json.data)
    );
  }
}

export class SubscriptionResponse {
  constructor(
      public result: null | any,
      public id: number
  ) {}

  static fromJSON(json: any): SubscriptionResponse {
    return new SubscriptionResponse(
        json.result,
        json.id
    );
  }
}
