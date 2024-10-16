import eventEmitter from './';

export const sendMessage = (message: string[]) => {
  eventEmitter.emit('LIST_SUBSCRIPTIONS', message);
};

export const onMessage = (callback: (msg: string[]) => void) => {
  eventEmitter.on('LIST_SUBSCRIPTIONS', callback);
};

export const off = (callback: (msg: string[]) => void) => {
  eventEmitter.off('LIST_SUBSCRIPTIONS', callback);
};

export const onResultOnce = async (callback: (msg: string[]) => void, TIMEOUT = 30000) => {
  return new Promise<string[]>((resolve, reject) => {
    const c = (message: string[]) => {
      resolve(message);
      off(callback);
    };

    eventEmitter.once('LIST_SUBSCRIPTIONS', c)

    // Set up a timeout to reject the promise if the event does not occur
    setTimeout(() => {
      eventEmitter.off('LIST_SUBSCRIPTIONS', callback);
      reject(new Error('Timeout waiting for event'));
    }, TIMEOUT);
  })
};


