import { AnyFunction, InvocationEvent, InvocationEventType, InvocationHandler } from './type';
import { addIgnoredMethodsToPrototype, isIgnoredMethod } from './utils';

const failQuitely = <T extends AnyFunction>(func: T, args: Parameters<T>, skip: boolean) => {
  if (skip) {
    return;
  }
  try {
    return func.apply(null, args);
  } catch (e) {}
};

const invokeMethod = (
  instance: any,
  method: Function,
  proto: any,
  propertyName: string,
  args: any[],
  hanlder: InvocationHandler,
  context: InvocationEvent['context'],
) => {
  const skip = isIgnoredMethod(proto, propertyName);

  failQuitely(
    hanlder,
    [
      {
        type: InvocationEventType.pre,
        arguments: args,
        method: propertyName,
        class: proto.constructor.name,
        context,
      },
    ],
    skip,
  );

  // provide a way for invoking method regardless it is async or sync function, attach the return value and the error(if it occurred) to the event object
  const returnVal = method.apply(instance, args);

  const post = (val: any, error?: Error) => {
    failQuitely(
      hanlder,
      [
        {
          type: InvocationEventType.post,
          arguments: args,
          return: val,
          method: propertyName,
          class: proto.constructor.name,
          context,
          error,
        },
      ],
      skip,
    );
  };

  const isThenable = returnVal && !!returnVal.then;

  if (isThenable) {
    // capture async return and potential error
    let rtnTemp: any, errTemp: Error;

    returnVal
      .then((r: any) => {
        rtnTemp = r;
      })
      .catch((e: Error) => {
        errTemp = e;
      })
      .finally(() => {
        post(rtnTemp, errTemp);
      });
  } else {
    post(returnVal);
  }

  return returnVal;
};

export const proxyMethod = (
  method: Function,
  proto: any,
  propertyName: string,
  handler: InvocationHandler,
  context: InvocationEvent['context'],
) =>
  function (this: any, ...args: any[]) {
    return invokeMethod(this, method, proto, propertyName, args, handler, context);
  };

const getMethods = (proto: any) => {
  return Object.getOwnPropertyNames(proto).filter((p) => typeof proto[p] === 'function');
};

export const extendConstructor = (
  constructor: any,
  handler: InvocationHandler,
  context: InvocationEvent['context'],
  extendProps?: any,
  proxyMethods?: boolean,
) => {
  const proto = constructor.prototype;
  return class extends constructor {
    constructor(...args: any[]) {
      // @ts-ignore
      super(...args);
      // Initializing meta
      addIgnoredMethodsToPrototype(proto, []);

      if (proxyMethods) {
        const methods = getMethods(proto);
        // proxy methods
        methods.forEach((propertyName: string) => {
          const method = proto[propertyName];

          this[propertyName] = proxyMethod(method, proto, propertyName, handler, context).bind(
            this,
          );
        });
      }
      // mount extend properties
      Object.keys(extendProps).forEach((propertyName) => {
        this[propertyName] = extendProps[propertyName];
      });
    }
  };
};
