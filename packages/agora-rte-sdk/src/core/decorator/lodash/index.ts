import { debounce, DebounceSettings, throttle, ThrottleSettings } from 'lodash';

const debounced =
  (wait?: number, options?: DebounceSettings) =>
  (proto: any, propertyName: string, descriptor: PropertyDescriptor) => {
    return {
      configurable: true,
      enumerable: false,
      get() {
        return debounce(descriptor.value, wait, options).bind(this);
      },
    };
  };

const throttled =
  (wait?: number, options?: ThrottleSettings) =>
  (proto: any, propertyName: string, descriptor: PropertyDescriptor) => {
    return {
      configurable: true,
      enumerable: false,
      get() {
        return throttle(descriptor.value, wait, options).bind(this);
      },
    };
  };

export const Lodash = { debounced, throttled };
