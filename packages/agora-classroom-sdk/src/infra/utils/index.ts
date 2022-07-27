import { isEmpty } from 'lodash';
import { LanguageEnum } from '../api';

export const getBrowserLanguage = (): LanguageEnum => {
  const usrlang = navigator.language;
  if (usrlang.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
};

export type AppStorage = Storage | MemoryStorage;

export class MemoryStorage {
  constructor(private readonly _storage = new Map<string, string>()) {}

  getItem(name: string) {
    return this._storage.get(name);
  }

  setItem(name: string, value: string) {
    this._storage.set(name, value);
  }

  removeItem(name: string) {
    this._storage.delete(name);
  }
}

export class CustomStorage {
  private storage: AppStorage;

  languageKey = 'demo_language';

  constructor() {
    this.storage = new MemoryStorage();
  }

  useSessionStorage() {
    this.storage = window.sessionStorage;
  }

  useLocalStorage() {
    this.storage = window.localStorage;
  }

  read(key: string) {
    try {
      const json = JSON.parse(this.storage.getItem(key) as string);
      return json;
    } catch (_) {
      return this.storage.getItem(key);
    }
  }

  save(key: string, val: unknown) {
    this.storage.setItem(key, JSON.stringify(val));
  }

  clear(key: string) {
    this.storage.removeItem(key);
  }

  setLanguage(lang: string) {
    this.save(this.languageKey, lang);
  }

  getLanguage() {
    const language = this.read(this.languageKey) ? this.read(this.languageKey) : navigator.language;
    return language;
  }

  getRtmMessage(): { count: number; messages: any[] } {
    const channelMessages = GlobalStorage.read('channelMessages');
    if (isEmpty(channelMessages))
      return {
        count: 0,
        messages: [],
      };
    const messages = channelMessages.filter((it: any) => it.message_type === 'group_message');
    const chatMessages = messages.reduce((collect: any[], value: any) => {
      const payload = value.payload;
      const json = JSON.parse(payload);
      if (json.content) {
        return collect.concat({
          account: json.account,
          content: json.content,
          ms: value.ms,
          src: value.src,
        });
      }
      return collect;
    }, []);
    return {
      messages: chatMessages,
      count: chatMessages.length,
    };
  }
}

export class PersistLocalStorage {
  private storage: AppStorage;

  languageKey = 'app_storage';

  constructor() {
    this.storage = window.localStorage;
  }

  saveCourseWareList(jsonStringify: string) {
    this.storage.setItem('courseWare', jsonStringify);
  }

  getCourseWareSaveList() {
    const str = this.storage.getItem('courseWare');
    if (!str) {
      return [];
    }
    try {
      return JSON.parse(str) as [];
    } catch (err) {
      return [];
    }
  }
}

export const GlobalStorage = new CustomStorage();

export const storage = new PersistLocalStorage();

export const number2Percent = (v: number, fixed = 0): string => {
  return !isNaN(Number(v * 100)) ? Number(v * 100).toFixed(fixed) + '%' : '0%';
};

export function audioBufferToWav(buffer: any, opt?: any) {
  opt = opt || {};

  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = opt.float32 ? 3 : 1;
  const bitDepth = format === 3 ? 32 : 16;

  let result;
  if (numChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }

  return encodeWAV(result, format, sampleRate, numChannels, bitDepth);
}

function encodeWAV(samples: any, format: any, sampleRate: any, numChannels: any, bitDepth: any) {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * bytesPerSample, true);
  if (format === 1) {
    // Raw PCM
    floatTo16BitPCM(view, 44, samples);
  } else {
    writeFloat32(view, 44, samples);
  }

  return buffer;
}

function interleave(inputL: any, inputR: any) {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function writeFloat32(output: any, offset: any, input: any) {
  for (let i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i], true);
  }
}

function floatTo16BitPCM(output: any, offset: any, input: any) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeString(view: any, offset: any, string: any) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export const appendBuffer = (buffer1: Float32Array, buffer2: Float32Array) => {
  const tmp = new Float32Array(buffer1.length + buffer2.length);
  tmp.set(new Float32Array(buffer1), 0);
  tmp.set(new Float32Array(buffer2), buffer1.length);
  return tmp;
};
export const mapToObject = (map: Map<any, any>) => {
  return [...map.entries()].reduce((obj, [key, value]) => ((obj[key] = value), obj), {});
};

const ImageFileTypes = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
  'image/apng',
  'image/svg+xml',
  'image/gif',
  'image/bmp',
  'image/avif',
  'image/tiff',
];

export function isSupportedImageType(file: File): boolean {
  return ImageFileTypes.includes(file.type);
}

export const dataURIToFile = (dataURI: string, filename: string) => {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  const ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a file, and you're done
  const file = new File([ab], filename, { type: mimeString });
  return file;
};
export const humpToLine = (str: string) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};
