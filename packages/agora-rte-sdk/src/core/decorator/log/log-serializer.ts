interface Serializer {
  match(obj: any): boolean;
  serialize(obj: any): string;
}

const serializers: Serializer[] = [];

const fileSerializer: Serializer = {
  match(obj: unknown) {
    return obj instanceof File;
  },
  serialize(file: File) {
    return JSON.stringify({ filename: file.name, size: file.size });
  },
};

serializers.push(fileSerializer);

export const addSerializer = (serializer: Serializer) => {
  serializers.push(serializer);
};

export const serialize = (data: unknown) => {
  const serializer = serializers.find((serializer: Serializer) => serializer.match(data));

  if (serializer) {
    return serializer.serialize(data);
  }

  return data;
};
