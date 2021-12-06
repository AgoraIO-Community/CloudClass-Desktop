export const iterateMap = <K, V, T, E>(
  map: Map<K, V>,
  processors?: {
    onFilter?: (key: K, item: V) => boolean;
    onMap?: (key: K, item: V) => T;
    onReduce?: (prev: E, key: K, item: V) => E;
  },
) => {
  const onFilter = processors?.onFilter || (() => true);

  const { onMap, onReduce } = processors || {};

  const list: T[] = [];
  let prev: E = undefined as unknown as E;

  for (const [k, v] of map.entries()) {
    if (onFilter(k, v)) {
      if (onMap) list.push(onMap(k, v));
      if (onReduce) prev = onReduce(prev, k, v);
    }
  }

  return { list, prev };
};

export const iterateSet = <V, T, E>(
  map: Set<V>,
  processors?: {
    onFilter?: (item: V) => boolean;
    onMap?: (item: V) => T;
    onReduce?: (prev: E, item: V) => E;
  },
) => {
  const onFilter = processors?.onFilter || (() => true);

  const { onMap, onReduce } = processors || {};

  const list: T[] = [];
  let prev: E = undefined as unknown as E;

  for (const item of map.values()) {
    if (onFilter(item)) {
      if (onMap) list.push(onMap(item));
      if (onReduce) prev = onReduce(prev, item);
    }
  }
  return { list, prev };
};
