const bound = (proto: any, propertyName: string, descriptor: PropertyDescriptor) => {
  let value = descriptor.value;
  let cacheMap = new WeakMap<Object, typeof value>();
  return {
    configurable: true,
    enumerable: false,
    get() {
      if (!cacheMap.has(this)) {
        cacheMap.set(this, value.bind(this));
      }

      const cache = cacheMap.get(this);

      return cache;
    },
    set(v: any) {
      cacheMap.set(this, v.bind(this));
    },
  };
};

export { bound };
