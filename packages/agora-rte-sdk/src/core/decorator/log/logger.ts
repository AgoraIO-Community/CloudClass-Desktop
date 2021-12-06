import { Injectable } from '../type';
import { Logger as loggerDelegate } from '../../logger';

export const createLogger = (constructor: any): Injectable.Logger => {
  return Object.freeze({
    info(...args) {
      loggerDelegate.info.apply(loggerDelegate, [`[${constructor.name}]`, ...args]);
    },
    warn(...args) {
      loggerDelegate.warn.apply(loggerDelegate, [`[${constructor.name}]`, ...args]);
    },
    error(...args) {
      loggerDelegate.error.apply(loggerDelegate, [`[${constructor.name}]`, ...args]);
    },
    debug(...args) {
      loggerDelegate.debug.apply(loggerDelegate, [`[${constructor.name}]`, ...args]);
    },
  });
};
