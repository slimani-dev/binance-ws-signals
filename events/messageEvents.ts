import eventEmitter from './';

export const sendMessage = (message: any) => {
  eventEmitter.emit('message', message);
};

export const onMessage = (callback: (msg: string) => void) => {
  eventEmitter.on('message', callback);
};

export const off = (callback: (msg: string) => void) => {
  eventEmitter.off('message', callback);
};

export const onResultOnce = async (callback: (msg: string) => void, TIMEOUT = 30000) => {
  return new Promise<string>((resolve, reject) => {
    const callback = (message: string) => {
      resolve(message);
      off(callback);
    };

    onMessage(callback)

    // Set up a timeout to reject the promise if the event does not occur
    setTimeout(() => {
      off(callback);
      reject(new Error('Timeout waiting for event'));
    }, TIMEOUT);
  })
};


