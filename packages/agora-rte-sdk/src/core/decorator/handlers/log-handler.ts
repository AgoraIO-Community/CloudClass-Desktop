import { Logger } from '../../logger';
import { InvocationEvent, InvocationEventType } from '../type';

const noop = () => {};

export const createLogHandler = (level: 'info' | 'warn' | 'error') => {
  const log = Logger[level] || noop;

  return (evt: InvocationEvent) => {
    if (evt.type === InvocationEventType.pre) {
      evt.context.start = new Date().getTime();
      const message: any[] = [`[${evt.class}] >>> [${evt.method}]`];
      evt.arguments?.length && message.push(', args:', evt.arguments);
      //@ts-ignore
      log(...message);
    } else {
      const elapsed = new Date().getTime() - evt.context.start;
      const message: any[] = [`[${evt.class}] <<< [${evt.method}]`];
      evt.return && message.push(', return:', evt.return);
      evt.error && message.push(', err:', evt.error);
      message.push(`, Time elapsed: ${elapsed}ms`);
      //@ts-ignore
      log(...message);
    }
  };
};
