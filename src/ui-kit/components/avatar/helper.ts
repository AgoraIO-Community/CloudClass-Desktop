import toUpper from 'lodash/toUpper';
const nameColorPalette = [
  '#4262FF',
  '#0081A7',
  '#F07167',
  '#6FCFA3',
  '#758BFD',
  '#B388EB',
  '#ACA885',
  '#70A9A1',
];

export const getNameColor = (userName: string) => {
  const arr = [];
  for (let i = 0; i < userName.length; i++) {
    arr[i] = userName.charCodeAt(i).toString(16).slice(-4);
  }
  return nameColorPalette[parseInt(arr.join(''), 16) % nameColorPalette.length];
};

export const splitName = (userName: string) => {
  const names = userName.split(' ');
  const [firstWord] = names;
  const lastWord = names[names.length - 1];
  const firstLetter = firstWord.split('')[0];
  const secondLetter =
    names.length > 1 ? lastWord.split('')[0] : lastWord.length > 1 ? lastWord.split('')[1] : '';

  return filterChineseWord([toUpper(firstLetter), toUpper(secondLetter)]);
};
const filterChineseWord = (word: string[]) => {
  const reg = /[\u4e00-\u9fa5]/;
  if (reg.test(word[1])) {
    return [word[0], ''];
  }
  return word;
};
