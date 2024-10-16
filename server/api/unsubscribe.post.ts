import {binanceWS} from '~~/utils/binanceWebSocket';
import CoinModel from "~~/models/CoinModel";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {symbol} = body;

  if (!symbol) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request. Symbol is required.',
    });
  }

  const coin = await CoinModel.createOrUpdate({
    symbol,
    deletedAt: new Date()
  })

  const success = await binanceWS.unsubscribe(coin);

  if (success) {
    return {message: `Unsubscribed from ${symbol.toLowerCase()}usdt@trade`};
  } else {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to unsubscribe. WebSocket might not be connected.',
    });
  }
});
