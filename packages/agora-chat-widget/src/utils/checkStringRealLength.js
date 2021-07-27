// import stringLength from "string-length";
import twemoji from 'twemoji';

/**
 * 检测字符串长度（中文&emoji 判定为一个字符）
 *
 * @export
 * @param {string} inputStr
 * @returns {number}
 */
export default function checkInputStringRealLength(inputStr) {
  if (typeof inputStr !== 'string') {
    return 0;
  }
  let length = 0;
  try {
    length = twemoji.parse(inputStr).replace(/<img.+?\/>/g, '_').length;
  } catch (e) {}
  return length;
}
