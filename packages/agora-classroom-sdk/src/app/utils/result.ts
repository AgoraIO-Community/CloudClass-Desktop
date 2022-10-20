import { ErrorCode } from './error';

export enum Status {
  Success,
  Failed,
}

export type ResultError = {
  status: Status.Failed;
  code: ErrorCode;
};

export type ResultSuccess<T = unknown> = {
  status: Status.Success;
  data: T;
};

export type Result<T = unknown> = ResultError | ResultSuccess<T>;

export const successResult = <O>(data: O): ResultSuccess<O> => {
  return {
    status: Status.Success,
    data,
  };
};

export const failResult = (code: ErrorCode): ResultError => {
  return {
    status: Status.Failed,
    code,
  };
};
