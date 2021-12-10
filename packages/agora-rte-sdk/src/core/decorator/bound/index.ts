const bound = (proto: any, propertyName: string, descriptor: PropertyDescriptor) => {
  let value = descriptor.value;

  return {
    configurable: true,
    enumerable: false,
    get(this: { __cacheMap: WeakMap<Object, typeof value> }) {
      let cacheMap = this.__cacheMap;
      if (!cacheMap) {
        cacheMap = new WeakMap<Object, typeof value>();
        this.__cacheMap = cacheMap;
      }

      if (!cacheMap.has(value)) {
        cacheMap.set(value, value.bind(this));
      }

      const cache = cacheMap.get(value);

      return cache;
    },
    set(this: { __cacheMap: WeakMap<Object, typeof value> }, v: any) {
      let cacheMap = this.__cacheMap;
      if (!cacheMap) {
        cacheMap = new WeakMap<Object, typeof value>();
        this.__cacheMap = cacheMap;
      }

      cacheMap.set(v, v.bind(this));
    },
  };
};

export { bound };
