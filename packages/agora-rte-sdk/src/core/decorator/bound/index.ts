const bound = (proto: any, propertyName: string, descriptor: PropertyDescriptor) => {
  let value = descriptor.value;
  return {
    configurable: true,
    enumerable: false,
    get() {
      return value.bind(this);
    },
    set(v: any) {
      value = v;
    },
  };
};

export { bound };
