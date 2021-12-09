const bound = (proto: any, propertyName: string, descriptor: PropertyDescriptor) => {
  let value = descriptor.value;
  let funCache: typeof value = null;
  return {
    configurable: true,
    enumerable: false,
    get() {
      if (!funCache) {
        funCache = value.bind(this);
      }
      return funCache;
    },
    set(v: any) {
      funCache = v.bind(this);
    },
  };
};

export { bound };
