import {binanceWS} from '~~/utils/binanceWebSocket';
import CoinModel from "~~/models/CoinModel";
import {onResultOnce} from "~~/events/activeSubscriptionsEvents";

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
    deletedAt: null
  })


  await binanceWS.listSubscriptions();

  const result = await onResultOnce((result) => result)

  if (result.includes(`${symbol.toLowerCase()}usdt@trade`)) {
    return {message: `Already subscribed to ${symbol.toLowerCase()}usdt@trade`};
  }

  const success = await binanceWS.subscribe(coin);

  if (success) {
    return {
      result,
      message: `Subscribed to ${symbol.toLowerCase()}usdt@trade`
    };
  } else {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to subscribe. WebSocket might not be connected.',
    });
  }
});
