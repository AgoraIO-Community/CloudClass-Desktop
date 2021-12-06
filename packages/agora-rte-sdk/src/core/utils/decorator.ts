export function immutable(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.get!;
  // @ts-ignore
  descriptor.get = function (value: any) {
    let res = (original as any).call(this, { ...value });
    return deepFreeze(res);
  };
  return descriptor;
}

export function deepFreeze(object: any) {
  if (!object) return;
  const propNames = Object.getOwnPropertyNames(object);

  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }

  return Object.freeze(object);
}
