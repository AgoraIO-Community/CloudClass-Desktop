export enum InvocationEventType {
  pre,
  post,
}

export type InvocationEvent = {
  type: InvocationEventType;
  context: Record<string, any>;
  class: string;
  method: string;
  arguments?: any[];
  return?: any;
  error?: Error;
};

export type InvocationHandler = (event: InvocationEvent) => void;

export type AnyFunction = (...args: any) => any;

export namespace Injectable {
  export type Logger = Pick<Console, 'info' | 'warn' | 'error' | 'debug'>;
}
