import { addIgnoredMethodsToPrototype } from '../utils';
import { extendConstructor, proxyMethod } from '../proxy';
import { createLogHandler } from '../handlers/log-handler';
import { AgoraRteLogLevel } from '../../../configs';
import { createLogger } from './logger';

const info = (proto: any, propertyName: string, descriptor: PropertyDescriptor) => {
  const context = {};
  const handler = createLogHandler('info');

  const method = proto[propertyName];
  const proxy = proxyMethod(method, proto, propertyName, handler, context);
  return {
    configurable: true,
    enumerable: false,
    get() {
      return proxy.bind(this);
    },
    // value: proxy,
  };
};

const warn = (proto: any, propertyName: string, descriptor: PropertyDescriptor) => {
  const context = {};
  const handler = createLogHandler('warn');

  const method = proto[propertyName];
  const proxy = proxyMethod(method, proto, propertyName, handler, context);
  return {
    configurable: true,
    enumerable: false,
    get() {
      return proxy.bind(this);
    },
    // value: proxy,
  };
};

const error = (proto: any, propertyName: string, descriptor: PropertyDescriptor) => {
  const context = {};
  const handler = createLogHandler('error');

  const method = proto[propertyName];
  const proxy = proxyMethod(method, proto, propertyName, handler, context);
  return {
    configurable: true,
    enumerable: false,
    get() {
      return proxy.bind(this);
    },
    // value: proxy,
  };
};

const silence = (proto: any, propertyName: string) => {
  addIgnoredMethodsToPrototype(proto, [propertyName]);
};

const attach = ({
  level = AgoraRteLogLevel.INFO,
  proxyMethods = true,
}: {
  level?: AgoraRteLogLevel;
  proxyMethods?: boolean;
}) => {
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const l = [, 'error', 'warn', 'info', 'info', 'info'][level];

    const context = {};
    const handler = createLogHandler(l as any);
    let logger = createLogger(constructor);
    // proxy all methods
    return extendConstructor(
      constructor,
      handler,
      context,
      { logger: logger },
      proxyMethods,
    ) as unknown as T;
  };
};

// const inject = (proto: any, propertyName: string) => {
//   Object.defineProperty(proto, propertyName, {
//     value: createLogger(proto.constructor),
//   });

//   return {
//     configurable: true,
//     enumerable: false,
//     get() {
//       createLogger(proto.constructor);
//       return proxyMethod(method, proto, propertyName, handler, context).bind(this);
//     },
//   };
// };

export const Log = {
  info,
  warn,
  error,
  attach,
  silence,
  // inject,
};
