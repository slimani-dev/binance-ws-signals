import {type Coin, Prisma, PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

class CoinModel implements Coin {
  static readonly SUBSCRIBE_TO_ALL: number = 101;
  static readonly LIST_SUBSCRIPTIONS: number = 102;

  symbol: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;


  constructor(
      coin: {
        symbol: string,
        id?: number,
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date
      }
  ) {
    const now = new Date();

    this.symbol = coin.symbol.toLowerCase();
    this.id = coin.id || 0;
    this.createdAt = coin.createdAt || now;
    this.updatedAt = coin.updatedAt || now;
    this.deletedAt = coin.deletedAt;
  }

// Save or update a coin
  async save() {
    const now = new Date()
    await prisma.coin.upsert({
      where: {symbol: this.symbol},
      update: {
        deletedAt: this.deletedAt,
        updatedAt: now
      },
      create: {
        ...(this.id ? {id: this.id} : {}),
        symbol: this.symbol,
        deletedAt: this.deletedAt,
        updatedAt: now,
        createdAt: this.createdAt
      }
    });

    return this;
  }

  // Soft delete a coin
  async softDelete() {
    const now = new Date();
    return prisma.coin.update({
      where: {symbol: this.symbol},
      data: {
        updatedAt: now,
        deletedAt: now,
      }
    });
  }

  async restore() {
    await prisma.coin.update({
      where: {symbol: this.symbol},
      data: {
        deletedAt: null,
      }
    });

    return this;
  }

  // Get a stream message for subscribe or unsubscribe
  getStreamMessage(action: 'SUBSCRIBE' | 'UNSUBSCRIBE') {
    const params = [`${this.symbol}usdt@trade`];
    const message = {
      method: action,
      params: params,
      id: this.updatedAt.getTime()
    };
    return JSON.stringify(message);
  }

  static getStreamMessage(coins: CoinModel[], action: 'SUBSCRIBE' | 'UNSUBSCRIBE') {
    const params = coins.map(coin => `${coin.symbol}usdt@trade`)

    const message = {
      method: action,
      params: params,
      id: CoinModel.SUBSCRIBE_TO_ALL
    };
    return JSON.stringify(message);
  }

  // Fetch all active coins (not soft deleted)
  static async all(withDeleted = false) {
    const coins = await prisma.coin.findMany({
      where: {
        ...(withDeleted ? {} : {deletedAt: null})
      }
    });

    return coins.map(coin => new CoinModel(coin));
  }

  // Find a coin by symbol, with option to include soft-deleted ones
  static async find(where: Prisma.CoinWhereInput): Promise<CoinModel | undefined> {
    let coin = await prisma.coin.findFirst({
      where
    });

    if (coin) {
      return new CoinModel(coin);
    }
  }

  static async create(coin: {
    symbol: string,
    createdAt?: Date,
    updatedAt?: Date,
  }): Promise<CoinModel> {
    const now = new Date();
    const c = await prisma.coin.create({
      data: {
        symbol: coin.symbol.toLowerCase(),
        updatedAt: coin.updatedAt || now,
        createdAt: coin.createdAt || now
      }
    });

    return new CoinModel(c);
  }

  static async createOrUpdate(coin: {
    symbol: string,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date,
  }): Promise<CoinModel> {
    const now = new Date();

    const c = await prisma.coin.upsert({
      where: {
        symbol: coin.symbol.toLowerCase(),
      },
      update: {
        deletedAt: coin.deletedAt,
        updatedAt: coin.updatedAt || now
      },
      create: {
        symbol: coin.symbol.toLowerCase(),
        deletedAt: coin.deletedAt,
        updatedAt: coin.updatedAt || now,
        createdAt: coin.createdAt || now
      },
    });

    return new CoinModel(c);
  }
}

export default CoinModel;
