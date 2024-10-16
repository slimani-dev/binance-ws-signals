import WebSocket from 'ws';

import {PrismaClient} from '@prisma/client';
import {SubscriptionResponse, TradeMessage} from "~~/types/binanceTypes";
import CoinModel from "~~/models/CoinModel";
import {sendMessage} from "~~/events/activeSubscriptionsEvents";

class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private activeCoins: CoinModel[] = [];

  constructor() {
    this.initWebSocket().then(r => {
      console.log('WebSocket initialized, Connecting ...')
    });
  }

  private async initWebSocket() {
    this.activeCoins = await CoinModel.all();

    this.ws = new WebSocket('wss://stream.binance.com:9443/stream');

    this.ws.on('open', async () => {
      console.log('Connected to Binance WebSocket');
      await this.subscribeToSavedCoins();
    });

    this.ws.on('message', async (data) => {
      const message = JSON.parse(data.toString());
      if (message.stream && message.data) {
        const tradeMessage = TradeMessage.fromJSON(message);
        const trade = tradeMessage.data;

        // find the coin from the active coins list
        let coin = this.activeCoins
            .find((coin) =>
                coin.symbol === trade.symbol.replace('USDT', '').toLowerCase()
            );

        if (!coin) {
          coin = await CoinModel.createOrUpdate({
            symbol: trade.symbol.replace('USDT', '')
          });
          await this.unsubscribe(coin)
        }

        // console.log('Received trade for', coin.symbol, ':', trade.price);


      } else if (message.result !== undefined && message.id !== undefined) {
        const subscriptionResponse = SubscriptionResponse.fromJSON(message)

        if (subscriptionResponse.id === CoinModel.LIST_SUBSCRIPTIONS) {
          console.log('Active subscriptions:', subscriptionResponse.result);
          sendMessage(subscriptionResponse.result)
          return;
        }

        if (subscriptionResponse.id === CoinModel.SUBSCRIBE_TO_ALL) {
          console.log('Subscribed to coins : ', this.activeCoins.map(coin => coin.symbol));
          return;
        }

        const coin = await CoinModel.find({
          updatedAt: new Date(subscriptionResponse.id)
        })

        if (coin) {
          console.log(coin.deletedAt ? 'Unsubscribed from' : 'Subscribed to', coin.symbol)
        } else {
          console.log('Received Subscription Response:', subscriptionResponse);
        }
      } else {
        console.log('Received unknown message:', message);
      }
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.ws.on('close', () => {
      console.log('Disconnected from Binance WebSocket');
      setTimeout(() => this.initWebSocket(), 5000);
    });
  }

  private async subscribeToSavedCoins() {
    if (this.ws?.readyState === WebSocket.OPEN && this.activeCoins.length > 0) {
      console.log('Subscribing to saved symbols');
      this.ws.send(CoinModel.getStreamMessage(this.activeCoins, "SUBSCRIBE"));
      return true;
    }


    return false;
  }

  public async listSubscriptions() {
    if (this.ws?.readyState === WebSocket.OPEN) {

      this.ws.send(JSON.stringify({
        "method": "LIST_SUBSCRIPTIONS",
        "id": CoinModel.LIST_SUBSCRIPTIONS
      }));

      return true;
    }
    return false;
  }

  public async subscribe(coin: CoinModel) {
    if (this.ws?.readyState === WebSocket.OPEN) {

      this.activeCoins = await CoinModel.all();

      this.ws.send(coin.getStreamMessage("SUBSCRIBE"));

      return true;
    }
    return false;
  }

  public async unsubscribe(coin: CoinModel) {
    if (this.ws?.readyState === WebSocket.OPEN) {

      this.activeCoins = await CoinModel.all();

      this.ws?.send(coin.getStreamMessage("UNSUBSCRIBE"));

      return true;
    }
    return false;
  }
}

export const binanceWS = new BinanceWebSocket();
