import { EduRoleTypeEnum, EduRoomTypeEnum } from '..';
import { UAParser } from 'ua-parser-js';
import { isNaN } from 'lodash';

export const EduRole2RteRole = (roomType: EduRoomTypeEnum, roleType: EduRoleTypeEnum) => {
  if (roleType === EduRoleTypeEnum.teacher) {
    return 'host';
  }
  if (roleType === EduRoleTypeEnum.assistant) {
    return 'assistant';
  }
  if (roomType === EduRoomTypeEnum.Room1v1Class && roleType === EduRoleTypeEnum.student) {
    return 'broadcaster';
  }

  if (roleType === EduRoleTypeEnum.invisible) {
    return 'invisible';
  }

  return 'audience';
};

export const RteRole2EduRole = (roomType: EduRoomTypeEnum, role: string) => {
  if (role === 'host') {
    return EduRoleTypeEnum.teacher;
  }

  if (role === 'assistant') {
    return EduRoleTypeEnum.assistant;
  }

  //下台学生 与班型无关
  if (role === 'audience') {
    return EduRoleTypeEnum.student;
  }

  //上台学生 与班型无关
  if (role === 'broadcaster') {
    return EduRoleTypeEnum.student;
  }

  if (role === 'invisible') {
    return EduRoleTypeEnum.invisible;
  }

  return EduRoleTypeEnum.none;
};

export const number2Percent = (v: number, fixed: number = 0): string => {
  return !isNaN(Number(v * 100)) ? Number(v * 100).toFixed(fixed) + '%' : '0%';
};

export class PersistLocalStorage {
  private storage: Storage;

  constructor() {
    this.storage = window.sessionStorage;
  }

  saveConversationReadTs(jsonStringify: string) {
    this.storage.setItem('conversationReadTs', jsonStringify);
  }

  getConversationReadTs() {
    const str = this.storage.getItem('conversationReadTs');
    if (!str) {
      return new Map();
    }
    try {
      return new Map(Object.entries(JSON.parse(str) as {}));
    } catch (err) {
      return new Map();
    }
  }
}

export const CustomBtoa = (input: any) => {
  let keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  let i = 0;

  while (i < input.length) {
    chr1 = input[i++];
    chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
    chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
};

export const ChatStorage = new PersistLocalStorage();

enum UAType {
  console = 'console',
  mobile = 'mobile',
  tablet = 'tablet',
  smarttv = 'starttv',
  wearable = 'wearable',
  embedded = 'embedded',
}

enum orientationType {
  potrait = 'portrait',
  landscape = 'landscape',
}
export class UUAparser {
  private static _userAgent: string = window.navigator.userAgent;
  private static _UAParserInstance = new UAParser(UUAparser._userAgent);

  static get getType() {
    return UUAparser._UAParserInstance.getDevice().type;
  }

  static get mobileBrowser() {
    const isTablet =
      (navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        /MacIntel/.test(navigator.platform)) ||
      'ontouchend' in document;
    return UUAparser.getType === UAType.mobile || UUAparser.getType === UAType.tablet || isTablet;
  }
}
