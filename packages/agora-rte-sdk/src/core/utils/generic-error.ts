export type GenericErrorExtraOptions = {
  errCode: string;
};

export class GenericError extends Error {
  stack?: string;
  code?: number = Number.MIN_VALUE;
  errCode?: string;

  constructor(err: any, extra?: GenericErrorExtraOptions) {
    super(err);
    if (err instanceof String) {
      this.message = `${err}`;
    } else {
      if (err.hasOwnProperty('stack')) {
        this.stack = err.stack;
      }
      if (err.hasOwnProperty('message')) {
        this.message = err.message;
      }
      if (err.hasOwnProperty('name')) {
        this.name = err.name;
      }
      if (err.hasOwnProperty('code')) {
        this.code = err.code;
      }

      if (extra && extra.hasOwnProperty('errCode')) {
        this.errCode = extra.errCode;
      }
    }
  }

  [Symbol.toPrimitive](hint: string) {
    if (hint === 'string') {
      return `GenericError: ${JSON.stringify({
        name: this.name,
        code: this.code,
        message: this.message,
        stack: this.stack,
      })}`;
    }
  }
}

export const GenericErrorWrapper = (err: any, extra?: GenericErrorExtraOptions): GenericError => {
  if (err instanceof GenericError) {
    return err;
  }
  return new GenericError(err, extra);
};
