export const addIgnoredMethodsToPrototype = (prototype: any, ignoredMethods: string[]) => {
  let methods: string[] = prototype.__$$ignoreMethods || [];
  methods = methods.concat(ignoredMethods);
  prototype.__$$ignoreMethods = methods;
};

export const isIgnoredMethod = (prototype: any, method: string) => {
  return prototype.__$$ignoreMethods && prototype.__$$ignoreMethods.indexOf(method) > -1;
};
